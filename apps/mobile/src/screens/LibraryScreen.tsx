import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { libraryApi, playlistsApi } from '../lib/api';
import { formatDuration } from '../lib/utils';
import { usePlayerStore } from '../stores/playerStore';

export function LibraryScreen({ navigation }: any) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { play } = usePlayerStore();

  useEffect(() => {
    libraryApi.getLibrary().then(setData).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>☰  Your Library</Text>

      {data?.playlists?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>01  Playlists</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {data.playlists.map((p: any) => (
              <TouchableOpacity key={p.id} style={styles.card} onPress={() => navigation.navigate('PlaylistDetail', { id: p.id })}>
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
          <Text style={styles.sectionTitle}>02  Liked Tracks</Text>
          {data.likedTracks.map((track: any, i: number) => (
            <TouchableOpacity key={track.id} style={styles.trackRow} onPress={() => play(track)}>
              <Text style={styles.index}>{String(i + 1).padStart(2, '0')}</Text>
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
  container: { flex: 1, backgroundColor: '#F5F5F0' },
  content: { padding: 20, paddingBottom: 100 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F0' },
  title: { fontSize: 28, fontWeight: '900', marginBottom: 24 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '900', textTransform: 'uppercase', marginBottom: 12, fontFamily: 'monospace' },
  card: { width: 140, marginRight: 12, backgroundColor: '#fff', borderWidth: 2, borderColor: '#000', padding: 8, shadowColor: '#000', shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0 },
  albumArt: { width: '100%', height: 120, borderWidth: 2, borderColor: '#000', marginBottom: 8 },
  cardTitle: { fontWeight: '700', fontSize: 12 },
  trackRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 2, borderColor: '#000', padding: 10, marginBottom: 6, shadowColor: '#000', shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0 },
  smallThumb: { width: 36, height: 36, borderWidth: 1.5, borderColor: '#000', marginRight: 10 },
  trackInfo: { flex: 1, marginRight: 8 },
  trackTitle: { fontWeight: '700', fontSize: 13 },
  artistName: { fontSize: 11, fontFamily: 'monospace', opacity: 0.6 },
  index: { width: 24, fontFamily: 'monospace', fontSize: 11, opacity: 0.5 },
  metadata: { fontFamily: 'monospace', fontSize: 10, borderWidth: 1, borderColor: '#000', paddingHorizontal: 4, paddingVertical: 1 },
});