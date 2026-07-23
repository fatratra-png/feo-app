import { useState } from 'react';
import { View, Text, TextInput, ScrollView, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { searchApi } from '../lib/api';
import { formatDuration } from '../lib/utils';
import { usePlayerStore } from '../stores/playerStore';

export function SearchScreen({ navigation }: any) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { play } = usePlayerStore();

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (text.length === 0) { setResults(null); return; }
    setLoading(true);
    try {
      const data = await searchApi.search(text);
      setResults(data);
    } catch {} finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>⌕  Search</Text>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Search artists, albums, tracks..."
        placeholderTextColor="#999"
        value={query}
        onChangeText={handleSearch}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {loading && <ActivityIndicator style={{ marginTop: 20 }} />}

        {results?.artists?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>01  Artists</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {results.artists.map((artist: any) => (
                <TouchableOpacity key={artist.id} style={styles.artistCard} onPress={() => navigation.navigate('ArtistDetail', { id: artist.id })}>
                  <Image source={{ uri: artist.image_url }} style={styles.artistImage} />
                  <Text style={styles.artistName}>{artist.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {results?.tracks?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>02  Tracks</Text>
            {results.tracks.map((track: any, i: number) => (
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F0' },
  content: { padding: 20, paddingBottom: 100 },
  header: { padding: 20, paddingBottom: 0 },
  logo: { fontSize: 28, fontWeight: '900', letterSpacing: -1, marginBottom: 16 },
  input: { marginHorizontal: 20, borderWidth: 3, borderColor: '#000', padding: 16, fontSize: 16, backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0 },
  section: { marginTop: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '900', textTransform: 'uppercase', marginBottom: 12, fontFamily: 'monospace' },
  artistCard: { alignItems: 'center', marginRight: 16, width: 100 },
  artistImage: { width: 72, height: 72, borderRadius: 36, borderWidth: 2, borderColor: '#000', marginBottom: 8 },
  artistName: { fontWeight: '700', fontSize: 12, textAlign: 'center' },
  trackRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 2, borderColor: '#000', padding: 10, marginBottom: 6, shadowColor: '#000', shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0 },
  smallThumb: { width: 36, height: 36, borderWidth: 1.5, borderColor: '#000', marginRight: 10 },
  trackInfo: { flex: 1, marginRight: 8 },
  trackTitle: { fontWeight: '700', fontSize: 13 },
  index: { width: 24, fontFamily: 'monospace', fontSize: 11, opacity: 0.5 },
  metadata: { fontFamily: 'monospace', fontSize: 10, borderWidth: 1, borderColor: '#000', paddingHorizontal: 4, paddingVertical: 1 },
});