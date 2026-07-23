import { create } from 'zustand';

interface ThemeState {
  isDark: boolean;
  toggle: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: localStorage.getItem('feo_theme') !== 'light',
  toggle: () =>
    set((state) => {
      const newTheme = !state.isDark;
      localStorage.setItem('feo_theme', newTheme ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', newTheme);
      return { isDark: newTheme };
    }),
}));