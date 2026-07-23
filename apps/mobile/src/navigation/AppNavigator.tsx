import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { LibraryScreen } from '../screens/LibraryScreen';
import { PlayerScreen } from '../screens/PlayerScreen';
import { usePlayerStore } from '../stores/playerStore';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICONS: Record<string, string> = { Home: '\u266B', Search: '\u2315', Library: '\u2630', Player: '\u25B6' };

function HomeTabs() {
  const { currentTrack } = usePlayerStore();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1e1e1e',
          borderTopWidth: 3,
          borderTopColor: '#333',
          height: 65,
          paddingBottom: 10,
          paddingTop: 8,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
        },
        tabBarLabelStyle: { fontSize: 9, fontWeight: '700', fontFamily: 'monospace', color: '#e0d8c8', letterSpacing: 1 },
        tabBarIcon: ({ focused }) => {
          const isPlayer = route.name === 'Player';
          return (
            <View style={{
              width: isPlayer ? 36 : 24,
              height: isPlayer ? 36 : 24,
              borderRadius: isPlayer ? 18 : 0,
              backgroundColor: isPlayer && currentTrack ? '#FFD700' : 'transparent',
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: isPlayer && currentTrack ? 2 : 0,
              borderColor: '#333',
            }}>
              <Text style={{
                fontSize: isPlayer ? 16 : 18,
                opacity: focused ? 1 : 0.4,
                color: isPlayer && currentTrack ? '#000' : '#e0d8c8',
              }}>
                {TAB_ICONS[route.name] || '\u2022'}
              </Text>
            </View>
          );
        },
        tabBarActiveTintColor: '#FFD700',
        tabBarInactiveTintColor: '#555',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Library" component={LibraryScreen} />
      <Tab.Screen name="Player" component={PlayerScreen} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 40, height: 40, borderWidth: 2, borderColor: '#333', backgroundColor: '#FFD700', justifyContent: 'center', alignItems: 'center', transform: [{ rotate: '-3deg' }] }}>
            <Text style={{ fontSize: 20, fontWeight: '900', color: '#000' }}>F</Text>
          </View>
          <Text style={{ fontSize: 36, fontWeight: '900', color: '#e0d8c8', letterSpacing: -2 }}>
            <Text style={{ color: '#FFD700' }}>F</Text>
            <Text style={{ color: '#FF6B9D' }}>E</Text>
            <Text style={{ color: '#0057FF' }}>O</Text>
            <Text style={{ color: '#FF3B30' }}>.</Text>
          </Text>
        </View>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={HomeTabs} />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
