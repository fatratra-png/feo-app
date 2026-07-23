import { pool, query } from './connection';

async function setupDatabase() {
  console.log('Setting up database schema...');

  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      display_name VARCHAR(100) NOT NULL,
      avatar_url TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      token TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS artists (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(200) NOT NULL,
      bio TEXT,
      image_url TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS albums (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title VARCHAR(300) NOT NULL,
      cover_url TEXT,
      release_year INTEGER NOT NULL,
      artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS tracks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title VARCHAR(300) NOT NULL,
      duration INTEGER NOT NULL,
      file_url TEXT,
      track_number INTEGER NOT NULL DEFAULT 1,
      artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
      album_id UUID REFERENCES albums(id) ON DELETE CASCADE,
      plays_count INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS playlists (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(200) NOT NULL,
      description TEXT,
      cover_url TEXT,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      is_public BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS playlist_tracks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
      track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
      position INTEGER NOT NULL DEFAULT 0,
      added_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(playlist_id, track_id)
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS likes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
      album_id UUID REFERENCES albums(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, track_id, album_id)
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS follows (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, artist_id)
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS listening_history (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
      listened_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  console.log('Database schema created successfully!');
  await pool.end();
}

setupDatabase().catch((err) => {
  console.error('Failed to setup database:', err);
  process.exit(1);
});