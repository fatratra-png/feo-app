import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './stores/authStore';
import { useThemeStore } from './stores/themeStore';
import { authApi } from './lib/api';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Home } from './pages/Home';
import { Search } from './pages/Search';
import { Discover } from './pages/Discover';
import { Library } from './pages/Library';
import { PlaylistDetail } from './pages/PlaylistDetail';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  if (isLoading) return <div className="p-8 font-mono text-sm opacity-50 animate-pulse">loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AuthInit({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      authApi.me().then(setUser).catch(() => setUser(null));
    } else {
      setLoading(false);
    }
  }, []);

  return <>{children}</>;
}

function ThemeInit() {
  const { isDark } = useThemeStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return null;
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeInit />
        <AuthInit>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/discover" element={<Discover />} />
              <Route path="/library" element={<Library />} />
              <Route path="/playlists/:id" element={<PlaylistDetail />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthInit>
      </BrowserRouter>
    </QueryClientProvider>
  );
}