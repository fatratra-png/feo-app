import { pool, query } from './connection';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('Seeding database...');

  await query(`DELETE FROM listening_history; DELETE FROM follows; DELETE FROM likes; DELETE FROM playlist_tracks; DELETE FROM playlists; DELETE FROM tracks; DELETE FROM albums; DELETE FROM artists; DELETE FROM refresh_tokens; DELETE FROM users;`);

  const passwordHash = await bcrypt.hash('passtestuser21', 10);
  const testUser = await query(
    `INSERT INTO users (email, password_hash, display_name) VALUES ($1, $2, $3) RETURNING id`,
    ['test@gmail.com', passwordHash, 'Tester']
  );
  const userId = testUser.rows[0].id;

  const artists = [
    { name: 'Lusso Vyper', bio: 'Malagasy hip-hop artist blending traditional rhythms with modern beats' },
    { name: 'Tence Mena', bio: 'Singer-songwriter from Antananarivo' },
    { name: 'Basta Lion', bio: 'Reggae and dancehall artist from Madagascar' },
    { name: 'Wawa', bio: 'Afro-pop sensation from the island' },
    { name: 'Black Nivo', bio: 'Rap and hip-hop artist' },
    { name: 'Mika Oli', bio: 'Contemporary Malagasy pop artist' },
  ];

  const artistIds: string[] = [];
  for (const a of artists) {
    const res = await query(
      `INSERT INTO artists (name, bio, image_url) VALUES ($1, $2, $3) RETURNING id`,
      [a.name, a.bio, `https://picsum.photos/seed/${a.name.replace(/\s/g, '')}/300/300`]
    );
    artistIds.push(res.rows[0].id);
  }

  const albumsData = [
    { title: 'Fahazavana', year: 2024, artistIdx: 0 },
    { title: 'Tany Vaovao', year: 2023, artistIdx: 1 },
    { title: 'Fiainana', year: 2024, artistIdx: 2 },
    { title: 'Mazotoa', year: 2023, artistIdx: 3 },
    { title: 'Mahery', year: 2024, artistIdx: 4 },
    { title: 'Fitiavana', year: 2024, artistIdx: 5 },
    { title: 'Tsy Miova', year: 2023, artistIdx: 0 },
    { title: 'Lalana', year: 2024, artistIdx: 1 },
  ];

  const albumIds: string[] = [];
  for (const alb of albumsData) {
    const res = await query(
      `INSERT INTO albums (title, cover_url, release_year, artist_id) VALUES ($1, $2, $3, $4) RETURNING id`,
      [alb.title, `https://picsum.photos/seed/album${alb.title.replace(/\s/g, '')}/300/300`, alb.year, artistIds[alb.artistIdx]]
    );
    albumIds.push(res.rows[0].id);
  }

  const trackNames = [
    'Fahazavana', 'Mazava', 'Tongava', 'Mitaraina', 'Sambatra',
    'Lalana', 'Tsara', 'Mahery', 'Foana', 'Mifona',
    'Tany Masina', 'Mankany', 'Avia', 'Miaraka', 'Ho Avy',
    'Rivotra', 'Orambe', 'Tara', 'Mandiova', 'Mandroso',
    'Faly', 'Miverina', 'Anio', 'Rahampitso', 'Mbola',
  ];

  const trackIds: string[] = [];
  for (let i = 0; i < trackNames.length; i++) {
    const albumIdx = Math.floor(i / 3) % albumIds.length;
    const artistIdx = Math.floor(i / 4) % artistIds.length;
    const duration = 180 + Math.floor(Math.random() * 180);
    const res = await query(
      `INSERT INTO tracks (title, duration, file_url, track_number, artist_id, album_id, plays_count)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [
        trackNames[i],
        duration,
        `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${(i % 16) + 1}.mp3`,
        (i % 10) + 1,
        artistIds[artistIdx],
        albumIds[albumIdx],
        Math.floor(Math.random() * 500000),
      ]
    );
    trackIds.push(res.rows[0].id);
  }

  const playlistNames = [
    { name: 'Malagasy Favorites', description: 'Top Malagasy tracks' },
    { name: 'Workout Mix', description: 'High energy tracks' },
    { name: 'Chill Evening', description: 'Relaxing vibes' },
    { name: 'Road Trip', description: 'Perfect for driving' },
  ];

  const playlistIds: string[] = [];
  for (const p of playlistNames) {
    const res = await query(
      `INSERT INTO playlists (name, description, cover_url, user_id, is_public)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [p.name, p.description, `https://picsum.photos/seed/playlist${p.name.replace(/\s/g, '')}/300/300`, userId, true]
    );
    playlistIds.push(res.rows[0].id);
  }

  for (let i = 0; i < playlistIds.length; i++) {
    const startIdx = i * 5;
    for (let j = 0; j < 5; j++) {
      const trackIdx = (startIdx + j) % trackIds.length;
      await query(
        `INSERT INTO playlist_tracks (playlist_id, track_id, position) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
        [playlistIds[i], trackIds[trackIdx], j]
      );
    }
  }

  for (let i = 0; i < 10; i++) {
    await query(
      `INSERT INTO likes (user_id, track_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [userId, trackIds[i]]
    );
  }

  for (let i = 0; i < 4; i++) {
    await query(
      `INSERT INTO follows (user_id, artist_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [userId, artistIds[i]]
    );
  }

  for (let i = 0; i < 15; i++) {
    const hoursAgo = i * 2;
    await query(
      `INSERT INTO listening_history (user_id, track_id, listened_at)
       VALUES ($1, $2, NOW() - INTERVAL '${hoursAgo} hours')`,
      [userId, trackIds[i % trackIds.length]]
    );
  }

  console.log('Seed complete!');
  console.log('  Test user: test@gmail.com / passtestuser21');
  console.log(`  ${trackIds.length} tracks, ${artistIds.length} artists, ${albumIds.length} albums, ${playlistIds.length} playlists`);
  await pool.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});