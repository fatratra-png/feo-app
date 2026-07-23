import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../stores/authStore';

export function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('test@gmail.com');
  const [password, setPassword] = useState('passtestuser21');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();

  const handleLogin = async () => {
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.logoRow}>
          <View style={styles.logoBox}>
            <Text style={styles.logoChar}>F</Text>
          </View>
          <Text style={styles.title}>
            <Text style={{ color: '#FFD700' }}>F</Text>
            <Text style={{ color: '#FF6B9D' }}>E</Text>
            <Text style={{ color: '#0057FF' }}>O</Text>
            <Text style={{ color: '#FF3B30' }}>.</Text>
          </Text>
        </View>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#666"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.buttonText}>Sign In</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}>No account? Register</Text>
        </TouchableOpacity>

        <View style={styles.demoBox}>
          <Text style={styles.demoText}>Demo credentials pre-filled</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', justifyContent: 'center', padding: 24 },
  card: { borderWidth: 3, borderColor: '#333', backgroundColor: '#1e1e1e', padding: 32, shadowColor: '#222', shadowOffset: { width: 6, height: 6 }, shadowOpacity: 1, shadowRadius: 0 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  logoBox: { width: 40, height: 40, borderWidth: 2, borderColor: '#333', backgroundColor: '#FFD700', justifyContent: 'center', alignItems: 'center', transform: [{ rotate: '-3deg' }] },
  logoChar: { fontSize: 20, fontWeight: '900', color: '#000' },
  title: { fontSize: 36, fontWeight: '900', letterSpacing: -1 },
  subtitle: { fontSize: 11, fontFamily: 'monospace', color: '#e0d8c8', opacity: 0.4, marginBottom: 32, letterSpacing: 1 },
  input: { borderWidth: 3, borderColor: '#444', padding: 16, fontSize: 14, marginBottom: 16, backgroundColor: '#2a2a2a', color: '#e0d8c8', shadowColor: '#222', shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0 },
  button: { backgroundColor: '#FFD700', borderWidth: 3, borderColor: '#333', padding: 16, alignItems: 'center', marginTop: 8, shadowColor: '#222', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0 },
  buttonText: { fontWeight: '900', fontSize: 14, color: '#000', textTransform: 'uppercase' },
  link: { textAlign: 'center', marginTop: 24, fontSize: 11, fontFamily: 'monospace', color: '#e0d8c8', opacity: 0.6, textDecorationLine: 'underline' },
  demoBox: { marginTop: 20, borderWidth: 1.5, borderColor: '#FF6B9D', backgroundColor: '#FF6B9D', padding: 10 },
  demoText: { textAlign: 'center', fontSize: 9, fontFamily: 'monospace', color: '#fff', fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
});
