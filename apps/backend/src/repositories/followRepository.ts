import { query } from '../db/connection';

export const followRepository = {
  async toggle(userId: string, artistId: string): Promise<boolean> {
    const existing = await query(
      'SELECT id FROM follows WHERE user_id = $1 AND artist_id = $2',
      [userId, artistId]
    );
    if (existing.rows.length > 0) {
      await query('DELETE FROM follows WHERE id = $1', [existing.rows[0].id]);
      return false;
    }
    await query('INSERT INTO follows (user_id, artist_id) VALUES ($1, $2)', [userId, artistId]);
    return true;
  },

  async getUserFollowedArtists(userId: string) {
    const res = await query(
      `SELECT a.*,
        (SELECT COUNT(*) FROM follows WHERE artist_id = a.id) as followers_count
       FROM follows f
       JOIN artists a ON f.artist_id = a.id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC`,
      [userId]
    );
    return res.rows;
  },
};