import { query } from '../db/connection';

export const userRepository = {
  async findByEmail(email: string) {
    const res = await query('SELECT * FROM users WHERE email = $1', [email]);
    return res.rows[0] || null;
  },

  async findById(id: string) {
    const res = await query(
      'SELECT id, email, display_name, avatar_url, created_at FROM users WHERE id = $1',
      [id]
    );
    return res.rows[0] || null;
  },

  async create(email: string, passwordHash: string, displayName: string) {
    const res = await query(
      `INSERT INTO users (email, password_hash, display_name) VALUES ($1, $2, $3) RETURNING id, email, display_name, avatar_url, created_at`,
      [email, passwordHash, displayName]
    );
    return res.rows[0];
  },

  async saveRefreshToken(userId: string, token: string, expiresAt: Date) {
    await query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [userId, token, expiresAt]
    );
  },

  async findRefreshToken(token: string) {
    const res = await query(
      'SELECT * FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()',
      [token]
    );
    return res.rows[0] || null;
  },

  async deleteRefreshToken(token: string) {
    await query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
  },

  async deleteUserRefreshTokens(userId: string) {
    await query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
  },
};