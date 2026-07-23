import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    url: process.env.DATABASE_URL || 'postgresql://feo:feo_dev_2024@localhost:5432/feo',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'feo-super-secret-jwt-key-2024',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'feo-super-secret-refresh-key-2024',
    accessExpiry: '15m',
    refreshExpiry: '7d',
  },
};