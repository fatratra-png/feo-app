import { query } from '../db/connection';

export const albumRepository = {
  async findAll(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const res = await query(
      `SELECT al.*, a.name as artist_name,
        (SELECT COUNT(*) FROM tracks WHERE album_id = al.id) as tracks_count
       FROM albums al
       JOIN artists a ON al.artist_id = a.id
       ORDER BY al.release_year DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    const countRes = await query('SELECT COUNT(*) FROM albums');
    return { rows: res.rows, total: parseInt(countRes.rows[0].count) };
  },

  async findById(id: string, userId?: string) {
    const res = await query(
      `SELECT al.*, a.name as artist_name,
        (SELECT COUNT(*) FROM tracks WHERE album_id = al.id) as tracks_count
        ${userId ? `, CASE WHEN l.id IS NOT NULL THEN true ELSE false END as is_liked` : ', false as is_liked'}
       FROM albums al
       JOIN artists a ON al.artist_id = a.id
       ${userId ? `LEFT JOIN likes l ON l.album_id = al.id AND l.user_id = $2` : ''}
       WHERE al.id = $1`,
      userId ? [id, userId] : [id]
    );
    return res.rows[0] || null;
  },

  async findByArtist(artistId: string) {
    const res = await query(
      `SELECT al.*, a.name as artist_name,
        (SELECT COUNT(*) FROM tracks WHERE album_id = al.id) as tracks_count
       FROM albums al
       JOIN artists a ON al.artist_id = a.id
       WHERE al.artist_id = $1
       ORDER BY al.release_year DESC`,
      [artistId]
    );
    return res.rows;
  },

  async search(queryStr: string, limit = 20) {
    const res = await query(
      `SELECT al.*, a.name as artist_name,
        (SELECT COUNT(*) FROM tracks WHERE album_id = al.id) as tracks_count
       FROM albums al
       JOIN artists a ON al.artist_id = a.id
       WHERE al.title ILIKE $1
       LIMIT $2`,
      [`%${queryStr}%`, limit]
    );
    return res.rows;
  },
};