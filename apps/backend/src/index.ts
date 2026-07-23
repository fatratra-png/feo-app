import express from 'express';
import cors from 'cors';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import playlistRoutes from './routes/playlists';
import likeRoutes from './routes/likes';
import followRoutes from './routes/follows';
import searchRoutes from './routes/search';
import libraryRoutes from './routes/library';
import youtubeRoutes from './routes/youtube';
import recommendationRoutes from './routes/recommendations';

const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/follows', followRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/youtube', youtubeRoutes);
app.use('/api/recommendations', recommendationRoutes);

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`FEO. API running on http://localhost:${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
});