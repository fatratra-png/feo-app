import { query } from '../db/connection';

export const trackRepository = {
  async findAll(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const res = await query(
      `SELECT t.*, a.name as artist_name, al.title as album_title, al.cover_url as album_cover_url
       FROM tracks t
       JOIN artists a ON t.artist_id = a.id
       JOIN albums al ON t.album_id = al.id
       ORDER BY t.plays_count DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    const countRes = await query('SELECT COUNT(*) FROM tracks');
    return { rows: res.rows, total: parseInt(countRes.rows[0].count) };
  },

  async findById(id: string, userId?: string) {
    const res = await query(
      `SELECT t.*, a.name as artist_name, al.title as album_title, al.cover_url as album_cover_url
       ${userId ? `, CASE WHEN l.id IS NOT NULL THEN true ELSE false END as is_liked` : ', false as is_liked'}
       FROM tracks t
       JOIN artists a ON t.artist_id = a.id
       JOIN albums al ON t.album_id = al.id
       ${userId ? `LEFT JOIN likes l ON l.track_id = t.id AND l.user_id = $2` : ''}
       WHERE t.id = $1`,
      userId ? [id, userId] : [id]
    );
    return res.rows[0] || null;
  },

  async findByAlbum(albumId: string) {
    const res = await query(
      `SELECT t.*, a.name as artist_name, al.title as album_title, al.cover_url as album_cover_url
       FROM tracks t
       JOIN artists a ON t.artist_id = a.id
       JOIN albums al ON t.album_id = al.id
       WHERE t.album_id = $1
       ORDER BY t.track_number`,
      [albumId]
    );
    return res.rows;
  },

  async findByArtist(artistId: string) {
    const res = await query(
      `SELECT t.*, a.name as artist_name, al.title as album_title, al.cover_url as album_cover_url
       FROM tracks t
       JOIN artists a ON t.artist_id = a.id
       JOIN albums al ON t.album_id = al.id
       WHERE t.artist_id = $1
       ORDER BY t.plays_count DESC`,
      [artistId]
    );
    return res.rows;
  },

  async search(queryStr: string, limit = 20) {
    const res = await query(
      `SELECT t.*, a.name as artist_name, al.title as album_title, al.cover_url as album_cover_url
       FROM tracks t
       JOIN artists a ON t.artist_id = a.id
       JOIN albums al ON t.album_id = al.id
       WHERE t.title ILIKE $1 OR a.name ILIKE $1
       LIMIT $2`,
      [`%${queryStr}%`, limit]
    );
    return res.rows;
  },

  async incrementPlays(trackId: string) {
    await query('UPDATE tracks SET plays_count = plays_count + 1 WHERE id = $1', [trackId]);
  },
};