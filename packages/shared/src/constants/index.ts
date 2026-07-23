export const API_BASE_URL = 'http://localhost:3001/api';

export const DURATION_UNITS = {
  MINUTE: 60,
  HOUR: 3600,
} as const;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'feo_access_token',
  REFRESH_TOKEN: 'feo_refresh_token',
  THEME: 'feo_theme',
  QUEUE: 'feo_queue',
  VOLUME: 'feo_volume',
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
} as const;