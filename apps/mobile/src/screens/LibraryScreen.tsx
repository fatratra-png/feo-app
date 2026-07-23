import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { libraryApi } from '../lib/api';
import { formatDuration } from '../lib/utils';
import { usePlayerStore } from '../stores/playerStore';

const COLORS = ['#FFD700', '#FF6B9D', '#0057FF', '#00D68F', '#B366FF', '#FF9500', '#FF3B30', '#00C7BE'];

export function LibraryScreen({ navigation }: any) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { play } = usePlayerStore();

  useEffect(() => {
    libraryApi.getLibrary().then(setData).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#FFD700" /></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoBox}><Text style={styles.logoIcon}>&#9776;</Text></View>
          <Text style={styles.logo}>Your Library</Text>
        </View>
        <Text style={styles.logoSub}>All your music</Text>
      </View>

      {data?.playlists?.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionNum, { backgroundColor: '#FFD700' }]}><Text style={styles.sectionNumText}>01</Text></View>
            <Text style={styles.sectionTitle}>Playlists</Text>
            <Text style={styles.metadata}>{data.playlists.length}</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {data.playlists.map((p: any, i: number) => (
              <TouchableOpacity
                key={p.id}
                style={[styles.card, { borderColor: COLORS[i % COLORS.length] }]}
                onPress={() => navigation.navigate('PlaylistDetail', { id: p.id })}
              >
                <Image source={{ uri: p.cover_url }} style={styles.albumArt} />
                <Text style={styles.cardTitle} numberOfLines={1}>{p.name}</Text>
                <Text style={styles.metadata}>{p.tracks_count} tracks</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {data?.likedTracks?.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionNum, { backgroundColor: '#FF6B9D' }]}><Text style={styles.sectionNumText}>02</Text></View>
            <Text style={styles.sectionTitle}>Liked Tracks</Text>
            <Text style={styles.metadata}>{data.likedTracks.length}</Text>
          </View>
          {data.likedTracks.map((track: any, i: number) => (
            <TouchableOpacity key={track.id} style={styles.trackRow} onPress={() => play(track)}>
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
          ))}
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
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoBox: { width: 36, height: 36, borderWidth: 2, borderColor: '#333', backgroundColor: '#FFD700', justifyContent: 'center', alignItems: 'center' },
  logoIcon: { fontSize: 18, color: '#000', fontWeight: '900' },
  logo: { fontSize: 28, fontWeight: '900', color: '#e0d8c8', letterSpacing: -1, textTransform: 'uppercase' },
  logoSub: { fontSize: 9, fontFamily: 'monospace', color: '#e0d8c8', opacity: 0.3, letterSpacing: 2, marginLeft: 46, marginTop: -2 },
  section: { marginBottom: 28 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  sectionNum: { width: 32, height: 32, borderWidth: 2, borderColor: '#333', justifyContent: 'center', alignItems: 'center' },
  sectionNumText: { fontFamily: 'monospace', fontSize: 11, fontWeight: '900', color: '#000' },
  sectionTitle: { fontSize: 16, fontWeight: '900', color: '#e0d8c8', textTransform: 'uppercase', letterSpacing: 0.5 },
  card: { width: 150, marginRight: 12, borderWidth: 2, borderColor: '#333', backgroundColor: '#1e1e1e', padding: 8, shadowColor: '#222', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0 },
  albumArt: { width: '100%', height: 130, borderWidth: 2, borderColor: '#333', marginBottom: 8, backgroundColor: '#2a2a2a' },
  cardTitle: { fontWeight: '700', fontSize: 12, color: '#e0d8c8' },
  trackRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: '#333', backgroundColor: '#1e1e1e', padding: 12, marginBottom: 6, shadowColor: '#222', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0 },
  indexBox: { width: 32, height: 32, borderWidth: 1.5, borderColor: '#333', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  indexText: { fontFamily: 'monospace', fontSize: 11, fontWeight: '900', color: '#000' },
  smallThumb: { width: 40, height: 40, borderWidth: 1.5, borderColor: '#333', marginRight: 10, backgroundColor: '#2a2a2a' },
  trackInfo: { flex: 1, marginRight: 8 },
  trackTitle: { fontWeight: '700', fontSize: 13, color: '#e0d8c8' },
  artistName: { fontSize: 11, fontFamily: 'monospace', color: '#e0d8c8', opacity: 0.5, marginTop: 2 },
  metadata: { fontFamily: 'monospace', fontSize: 10, color: '#e0d8c8', opacity: 0.4, borderWidth: 1, borderColor: '#444', paddingHorizontal: 6, paddingVertical: 2 },
});
