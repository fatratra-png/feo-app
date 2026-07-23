import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from './src/stores/authStore';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <>
      <StatusBar style="dark" />
      <AppNavigator />
    </>
  );
}