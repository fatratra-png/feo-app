import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../stores/authStore';

export function RegisterScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuthStore();

  const handleRegister = async () => {
    setLoading(true);
    try {
      await register(email, password, displayName);
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
        <Text style={styles.subtitle}>Create your account</Text>

        <TextInput style={styles.input} placeholder="Display Name" placeholderTextColor="#666" value={displayName} onChangeText={setDisplayName} />
        <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#666" value={email} onChangeText={setEmail} autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#666" value={password} onChangeText={setPassword} secureTextEntry />

        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.buttonText}>Create Account</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>Already have an account? Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', justifyContent: 'center', padding: 24 },
  card: { borderWidth: 3, borderColor: '#333', backgroundColor: '#1e1e1e', padding: 32, shadowColor: '#222', shadowOffset: { width: 6, height: 6 }, shadowOpacity: 1, shadowRadius: 0 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  logoBox: { width: 40, height: 40, borderWidth: 2, borderColor: '#333', backgroundColor: '#FF6B9D', justifyContent: 'center', alignItems: 'center', transform: [{ rotate: '3deg' }] },
  logoChar: { fontSize: 20, fontWeight: '900', color: '#000' },
  title: { fontSize: 36, fontWeight: '900', letterSpacing: -1 },
  subtitle: { fontSize: 11, fontFamily: 'monospace', color: '#e0d8c8', opacity: 0.4, marginBottom: 32, letterSpacing: 1 },
  input: { borderWidth: 3, borderColor: '#444', padding: 16, fontSize: 14, marginBottom: 16, backgroundColor: '#2a2a2a', color: '#e0d8c8', shadowColor: '#222', shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0 },
  button: { backgroundColor: '#FF6B9D', borderWidth: 3, borderColor: '#333', padding: 16, alignItems: 'center', marginTop: 8, shadowColor: '#222', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0 },
  buttonText: { fontWeight: '900', fontSize: 14, color: '#000', textTransform: 'uppercase' },
  link: { textAlign: 'center', marginTop: 24, fontSize: 11, fontFamily: 'monospace', color: '#e0d8c8', opacity: 0.6, textDecorationLine: 'underline' },
});
