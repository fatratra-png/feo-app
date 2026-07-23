import { query } from '../db/connection';

export const historyRepository = {
  async add(userId: string, trackId: string) {
    await query(
      'INSERT INTO listening_history (user_id, track_id) VALUES ($1, $2)',
      [userId, trackId]
    );
  },

  async getByUser(userId: string, limit = 50) {
    const res = await query(
      `SELECT lh.*, t.*, a.name as artist_name, al.title as album_title, al.cover_url as album_cover_url
       FROM listening_history lh
       JOIN tracks t ON lh.track_id = t.id
       JOIN artists a ON t.artist_id = a.id
       JOIN albums al ON t.album_id = al.id
       WHERE lh.user_id = $1
       ORDER BY lh.listened_at DESC
       LIMIT $2`,
      [userId, limit]
    );
    return res.rows;
  },
};