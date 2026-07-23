import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { libraryApi } from '../lib/api';
import { formatDuration } from '../lib/utils';
import { usePlayerStore } from '../stores/playerStore';

const COLORS = ['#FFD700', '#FF6B9D', '#0057FF', '#00D68F', '#B366FF', '#FF9500', '#FF3B30', '#00C7BE'];

export function HomeScreen({ navigation }: any) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { play } = usePlayerStore();

  useEffect(() => {
    libraryApi.getHome().then(setData).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#FFD700" /></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoBox}>
            <Text style={styles.logoChar}>F</Text>
          </View>
          <Text style={styles.logo}>
            <Text style={{ color: '#FFD700' }}>F</Text>
            <Text style={{ color: '#FF6B9D' }}>E</Text>
            <Text style={{ color: '#0057FF' }}>O</Text>
            <Text style={{ color: '#FF3B30' }}>.</Text>
          </Text>
        </View>
        <Text style={styles.logoSub}>Henoy ara</Text>
      </View>

      {data?.recentlyPlayed?.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionNumber}><Text style={styles.sectionNumberText}>01</Text></View>
            <Text style={styles.sectionTitle}>Recently Played</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {data.recentlyPlayed.slice(0, 8).map((item: any, i: number) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.horizontalCard, { borderColor: COLORS[i % COLORS.length] }]}
                onPress={() => play(item)}
              >
                <Image source={{ uri: item.album_cover_url }} style={styles.thumbnail} />
                <Text style={styles.trackTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.metadata}>{formatDuration(item.duration)}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {data?.topTracks?.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionNumber, { backgroundColor: '#FF6B9D' }]}><Text style={styles.sectionNumberText}>02</Text></View>
            <Text style={styles.sectionTitle}>Top Tracks</Text>
            <Text style={styles.metadata}>{data.topTracks.length}</Text>
          </View>
          {data.topTracks.slice(0, 10).map((track: any, i: number) => {
            const isActive = i === 0;
            return (
              <TouchableOpacity
                key={track.id}
                style={[styles.trackRow, isActive && styles.trackRowActive]}
                onPress={() => play(track)}
              >
                <View style={[styles.indexBox, { backgroundColor: COLORS[i % COLORS.length] }]}>
                  <Text style={styles.indexText}>{String(i + 1).padStart(2, '0')}</Text>
                </View>
                <Image source={{ uri: track.album_cover_url }} style={styles.smallThumb} />
                <View style={styles.trackInfo}>
                  <Text style={styles.trackTitle} numberOfLines={1}>{track.title}</Text>
                  <Text style={styles.artistName}>{track.artist_name}</Text>
                </View>
                <Text style={styles.metadata}>{formatDuration(track.duration)}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  content: { padding: 20, paddingBottom: 120 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
  header: { marginBottom: 28 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoBox: { width: 36, height: 36, borderWidth: 2, borderColor: '#333', justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFD700', transform: [{ rotate: '-3deg' }] },
  logoChar: { fontSize: 20, fontWeight: '900', color: '#000' },
  logo: { fontSize: 36, fontWeight: '900', letterSpacing: -2 },
  logoSub: { fontSize: 9, fontFamily: 'monospace', color: '#e0d8c8', opacity: 0.3, letterSpacing: 3, marginTop: 4, marginLeft: 4 },

  section: { marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  sectionNumber: { width: 32, height: 32, borderWidth: 2, borderColor: '#333', backgroundColor: '#FFD700', justifyContent: 'center', alignItems: 'center', shadowColor: '#222', shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0 },
  sectionNumberText: { fontFamily: 'monospace', fontSize: 11, fontWeight: '900', color: '#000' },
  sectionTitle: { fontSize: 16, fontWeight: '900', color: '#e0d8c8', textTransform: 'uppercase', letterSpacing: 0.5 },
  horizontalScroll: { marginLeft: -4, marginBottom: 4 },

  horizontalCard: { width: 150, marginRight: 12, borderWidth: 2, borderColor: '#333', backgroundColor: '#1e1e1e', padding: 8, shadowColor: '#222', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0 },
  thumbnail: { width: '100%', height: 130, borderWidth: 2, borderColor: '#333', marginBottom: 8, backgroundColor: '#2a2a2a' },

  trackRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: '#333', backgroundColor: '#1e1e1e', padding: 12, marginBottom: 6, shadowColor: '#222', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0 },
  trackRowActive: { borderColor: '#FFD700', backgroundColor: '#FFD700' },
  indexBox: { width: 32, height: 32, borderWidth: 1.5, borderColor: '#333', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  indexText: { fontFamily: 'monospace', fontSize: 11, fontWeight: '900', color: '#000' },
  smallThumb: { width: 40, height: 40, borderWidth: 1.5, borderColor: '#333', marginRight: 10, backgroundColor: '#2a2a2a' },
  trackInfo: { flex: 1, marginRight: 8 },
  trackTitle: { fontWeight: '700', fontSize: 13, color: '#e0d8c8' },
  artistName: { fontSize: 11, fontFamily: 'monospace', color: '#e0d8c8', opacity: 0.5, marginTop: 2 },
  metadata: { fontFamily: 'monospace', fontSize: 10, color: '#e0d8c8', opacity: 0.4, borderWidth: 1, borderColor: '#444', paddingHorizontal: 6, paddingVertical: 2 },
});
