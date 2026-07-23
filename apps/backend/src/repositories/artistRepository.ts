import { query } from '../db/connection';

export const artistRepository = {
  async findAll(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const res = await query(
      `SELECT a.*,
        (SELECT COUNT(*) FROM follows WHERE artist_id = a.id) as followers_count
       FROM artists a
       ORDER BY followers_count DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    const countRes = await query('SELECT COUNT(*) FROM artists');
    return { rows: res.rows, total: parseInt(countRes.rows[0].count) };
  },

  async findById(id: string, userId?: string) {
    const res = await query(
      `SELECT a.*,
        (SELECT COUNT(*) FROM follows WHERE artist_id = a.id) as followers_count
        ${userId ? `, CASE WHEN f.id IS NOT NULL THEN true ELSE false END as is_followed` : ', false as is_followed'}
       FROM artists a
       ${userId ? `LEFT JOIN follows f ON f.artist_id = a.id AND f.user_id = $2` : ''}
       WHERE a.id = $1`,
      userId ? [id, userId] : [id]
    );
    return res.rows[0] || null;
  },

  async search(queryStr: string, limit = 20) {
    const res = await query(
      `SELECT a.*,
        (SELECT COUNT(*) FROM follows WHERE artist_id = a.id) as followers_count
       FROM artists a
       WHERE a.name ILIKE $1
       LIMIT $2`,
      [`%${queryStr}%`, limit]
    );
    return res.rows;
  },
};