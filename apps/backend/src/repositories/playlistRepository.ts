import { query } from '../db/connection';

export const playlistRepository = {
  async findAll(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const res = await query(
      `SELECT p.*, u.display_name as user_name,
        (SELECT COUNT(*) FROM playlist_tracks WHERE playlist_id = p.id) as tracks_count
       FROM playlists p
       JOIN users u ON p.user_id = u.id
       WHERE p.is_public = true
       ORDER BY p.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    const countRes = await query('SELECT COUNT(*) FROM playlists WHERE is_public = true');
    return { rows: res.rows, total: parseInt(countRes.rows[0].count) };
  },

  async findById(id: string) {
    const res = await query(
      `SELECT p.*, u.display_name as user_name,
        (SELECT COUNT(*) FROM playlist_tracks WHERE playlist_id = p.id) as tracks_count
       FROM playlists p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = $1`,
      [id]
    );
    return res.rows[0] || null;
  },

  async findByUser(userId: string) {
    const res = await query(
      `SELECT p.*, u.display_name as user_name,
        (SELECT COUNT(*) FROM playlist_tracks WHERE playlist_id = p.id) as tracks_count
       FROM playlists p
       JOIN users u ON p.user_id = u.id
       WHERE p.user_id = $1
       ORDER BY p.created_at DESC`,
      [userId]
    );
    return res.rows;
  },

  async create(name: string, description: string | null, userId: string, isPublic: boolean) {
    const res = await query(
      `INSERT INTO playlists (name, description, user_id, is_public)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, description, userId, isPublic]
    );
    return res.rows[0];
  },

  async update(id: string, fields: { name?: string; description?: string; cover_url?: string; is_public?: boolean }) {
    const setClauses: string[] = [];
    const values: any[] = [];
    let idx = 1;

    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        setClauses.push(`${key} = $${idx}`);
        values.push(value);
        idx++;
      }
    }

    if (setClauses.length === 0) return null;

    setClauses.push(`updated_at = NOW()`);
    values.push(id);
    const res = await query(
      `UPDATE playlists SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    return res.rows[0] || null;
  },

  async delete(id: string) {
    await query('DELETE FROM playlists WHERE id = $1', [id]);
  },

  async getTracks(playlistId: string) {
    const res = await query(
      `SELECT t.*, a.name as artist_name, al.title as album_title, al.cover_url as album_cover_url,
        pt.position, pt.added_at
       FROM playlist_tracks pt
       JOIN tracks t ON pt.track_id = t.id
       JOIN artists a ON t.artist_id = a.id
       JOIN albums al ON t.album_id = al.id
       WHERE pt.playlist_id = $1
       ORDER BY pt.position`,
      [playlistId]
    );
    return res.rows;
  },

  async addTrack(playlistId: string, trackId: string) {
    const maxPos = await query(
      'SELECT COALESCE(MAX(position), -1) + 1 as next_pos FROM playlist_tracks WHERE playlist_id = $1',
      [playlistId]
    );
    const nextPos = maxPos.rows[0].next_pos;
    await query(
      'INSERT INTO playlist_tracks (playlist_id, track_id, position) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
      [playlistId, trackId, nextPos]
    );
  },

  async removeTrack(playlistId: string, trackId: string) {
    await query(
      'DELETE FROM playlist_tracks WHERE playlist_id = $1 AND track_id = $2',
      [playlistId, trackId]
    );
  },

  async reorderTracks(playlistId: string, trackIds: string[]) {
    for (let i = 0; i < trackIds.length; i++) {
      await query(
        'UPDATE playlist_tracks SET position = $1 WHERE playlist_id = $2 AND track_id = $3',
        [i, playlistId, trackIds[i]]
      );
    }
  },

  async search(queryStr: string, limit = 20) {
    const res = await query(
      `SELECT p.*, u.display_name as user_name,
        (SELECT COUNT(*) FROM playlist_tracks WHERE playlist_id = p.id) as tracks_count
       FROM playlists p
       JOIN users u ON p.user_id = u.id
       WHERE p.is_public = true AND p.name ILIKE $1
       LIMIT $2`,
      [`%${queryStr}%`, limit]
    );
    return res.rows;
  },
};