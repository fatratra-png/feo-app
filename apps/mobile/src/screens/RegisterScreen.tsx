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
        <Text style={styles.title}>FEO.</Text>
        <Text style={styles.subtitle}>create your account</Text>

        <TextInput style={styles.input} placeholder="Display Name" placeholderTextColor="#999" value={displayName} onChangeText={setDisplayName} />
        <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#999" value={email} onChangeText={setEmail} autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#999" value={password} onChangeText={setPassword} secureTextEntry />

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
  container: { flex: 1, backgroundColor: '#F5F5F0', justifyContent: 'center', padding: 24 },
  card: { backgroundColor: '#fff', borderWidth: 3, borderColor: '#000', padding: 32, shadowColor: '#000', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0 },
  title: { fontSize: 36, fontWeight: '900', letterSpacing: -1, marginBottom: 4 },
  subtitle: { fontSize: 12, fontFamily: 'monospace', opacity: 0.6, marginBottom: 32 },
  input: { borderWidth: 3, borderColor: '#000', padding: 16, fontSize: 14, marginBottom: 16, backgroundColor: '#F5F5F0', shadowColor: '#000', shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0 },
  button: { backgroundColor: '#FFD700', borderWidth: 3, borderColor: '#000', padding: 16, alignItems: 'center', marginTop: 8, shadowColor: '#000', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0 },
  buttonText: { fontWeight: '700', fontSize: 14, textTransform: 'uppercase' },
  link: { textAlign: 'center', marginTop: 24, fontSize: 12, fontFamily: 'monospace', textDecorationLine: 'underline' },
});