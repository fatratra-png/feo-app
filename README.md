# FEO.

**Henoy ara** — A Spotify clone with neo-brutalist design.

## Tech Stack

| Layer       | Technology                                                               |
| ----------- | ------------------------------------------------------------------------ |
| **Backend** | Node.js + Express + TypeScript, PostgreSQL (raw SQL with `pg`)           |
| **Web**     | React 19 + TypeScript, Vite, TanStack Query, Zustand, TailwindCSS v4    |
| **Mobile**  | React Native + Expo, React Navigation, Expo AV, Zustand                  |
| **Shared**  | `packages/shared` — types, constants, utilities                          |

## Prerequisites

- Node.js >= 20
- npm >= 10
- PostgreSQL >= 16
- Expo CLI (`npm install -g expo-cli`) for mobile development
- Android Studio / Xcode (for mobile emulators)

## Quick Start

### 1. Database

```bash
# Create database and user
sudo -u postgres psql -c "CREATE DATABASE feo;"
sudo -u postgres psql -c "CREATE USER feo WITH PASSWORD 'feo_dev_2024';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE feo TO feo;"
sudo -u postgres psql -d feo -c "GRANT ALL ON SCHEMA public TO feo;"

# Run migrations and seed
cd apps/backend
npm run db:setup
npm run db:seed
```

### 2. Backend

```bash
cd apps/backend
npm install
cp .env.example .env
npm run dev
```

API runs on `http://localhost:3001`

### 3. Web Frontend

```bash
cd apps/web
npm install
npm run dev
```

App runs on `http://localhost:5173` (proxies API to backend)

### 4. Mobile (Expo)

```bash
cd apps/mobile
npm install
npx expo start
```

Scan QR code with Expo Go, or press `a` for Android / `i` for iOS emulator.

## Test Credentials

- **Email:** test@gmail.com
- **Password:** passtestuser21

## Project Structure

```
feo/
├── apps/
│   ├── backend/        # Express REST API
│   │   ├── src/
│   │   │   ├── config/        # Environment & app config
│   │   │   ├── controllers/   # Request handlers
│   │   │   ├── db/            # Database setup & seed
│   │   │   ├── middleware/    # Auth & error handling
│   │   │   ├── repositories/  # Data access layer
│   │   │   ├── routes/        # API route definitions
│   │   │   └── services/      # Business logic
│   │   └── .env.example
│   ├── web/            # React SPA
│   │   └── src/
│   │       ├── components/    # Reusable UI components
│   │       ├── lib/           # API client & utilities
│   │       ├── pages/         # Route pages
│   │       ├── stores/        # Zustand state stores
│   │       └── styles/        # TailwindCSS & custom styles
│   └── mobile/         # React Native / Expo app
│       └── src/
│           ├── lib/           # API client
│           ├── navigation/    # React Navigation setup
│           ├── screens/       # Screen components
│           └── stores/        # Zustand stores
└── packages/
    └── shared/         # Shared types, constants, utils
```

## API Endpoints

### Auth
- `POST /api/auth/register` — Create account
- `POST /api/auth/login` — Sign in
- `POST /api/auth/refresh` — Refresh tokens
- `GET /api/auth/me` — Current user
- `POST /api/auth/logout` — Sign out

### Tracks
- `GET /api/tracks` — List tracks (paginated)
- `GET /api/tracks/:id` — Track details
- `GET /api/tracks/album/:albumId` — Tracks by album
- `GET /api/tracks/artist/:artistId` — Tracks by artist
- `POST /api/tracks/:id/play` — Record play (requires auth)

### Albums
- `GET /api/albums` — List albums
- `GET /api/albums/:id` — Album details

### Artists
- `GET /api/artists` — List artists
- `GET /api/artists/:id` — Artist details

### Playlists
- `GET /api/playlists` — Public playlists
- `GET /api/playlists/me` — User's playlists (auth)
- `GET /api/playlists/:id` — Playlist details with tracks
- `POST /api/playlists` — Create playlist (auth)
- `PUT /api/playlists/:id` — Update playlist (auth)
- `DELETE /api/playlists/:id` — Delete playlist (auth)
- `POST /api/playlists/:id/tracks` — Add track (auth)
- `DELETE /api/playlists/:id/tracks/:trackId` — Remove track (auth)

### Library & Likes
- `GET /api/library` — Full library (auth)
- `GET /api/library/home` — Home feed (auth)
- `GET /api/likes/tracks` — Liked tracks (auth)
- `POST /api/likes/tracks/:trackId` — Toggle like (auth)
- `POST /api/follows/artists/:artistId` — Toggle follow (auth)

### Search
- `GET /api/search?q=query` — Search everything

## Design — Neo-Brutalism

- Thick black borders (2-3px) on all elements
- Hard drop shadows (4px 4px 0px)
- Bold, uppercase typography with numbered section indices (01, 02, 03...)
- Color palette: Off-white bg (#F5F5F0), Brutal Yellow (#FFD700), Brutal Pink (#FF6B9D), Electric Blue (#0057FF), Vivid Red (#FF3B30)
- Monospace metadata tags on cards
- Pressed-effect on click (translate + reduced shadow)
- Dark/light mode toggle

## License

MIT