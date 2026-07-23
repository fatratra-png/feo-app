import { query } from '../db/connection';

export const likeRepository = {
  async toggleTrack(userId: string, trackId: string): Promise<boolean> {
    const existing = await query(
      'SELECT id FROM likes WHERE user_id = $1 AND track_id = $2',
      [userId, trackId]
    );
    if (existing.rows.length > 0) {
      await query('DELETE FROM likes WHERE id = $1', [existing.rows[0].id]);
      return false;
    }
    await query('INSERT INTO likes (user_id, track_id) VALUES ($1, $2)', [userId, trackId]);
    return true;
  },

  async toggleAlbum(userId: string, albumId: string): Promise<boolean> {
    const existing = await query(
      'SELECT id FROM likes WHERE user_id = $1 AND album_id = $2',
      [userId, albumId]
    );
    if (existing.rows.length > 0) {
      await query('DELETE FROM likes WHERE id = $1', [existing.rows[0].id]);
      return false;
    }
    await query('INSERT INTO likes (user_id, album_id) VALUES ($1, $2)', [userId, albumId]);
    return true;
  },

  async getUserLikedTracks(userId: string) {
    const res = await query(
      `SELECT t.*, a.name as artist_name, al.title as album_title, al.cover_url as album_cover_url
       FROM likes l
       JOIN tracks t ON l.track_id = t.id
       JOIN artists a ON t.artist_id = a.id
       JOIN albums al ON t.album_id = al.id
       WHERE l.user_id = $1 AND l.track_id IS NOT NULL
       ORDER BY l.created_at DESC`,
      [userId]
    );
    return res.rows;
  },

  async getUserLikedAlbums(userId: string) {
    const res = await query(
      `SELECT al.*, a.name as artist_name,
        (SELECT COUNT(*) FROM tracks WHERE album_id = al.id) as tracks_count
       FROM likes l
       JOIN albums al ON l.album_id = al.id
       JOIN artists a ON al.artist_id = a.id
       WHERE l.user_id = $1 AND l.album_id IS NOT NULL
       ORDER BY l.created_at DESC`,
      [userId]
    );
    return res.rows;
  },
};