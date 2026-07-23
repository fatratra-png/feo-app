import { useEffect, useRef, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Audio } from 'expo-av';
import { usePlayerStore } from '../stores/playerStore';
import { formatDuration } from '../lib/utils';

export function PlayerScreen() {
  const { currentTrack, isPlaying, queue, queueIndex, play, pause, resume, next, previous } = usePlayerStore();
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [position, setPosition] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  useEffect(() => {
    return sound ? () => { sound.unloadAsync(); } : undefined;
  }, [sound]);

  useEffect(() => {
    if (currentTrack?.file_url) {
      loadTrack(currentTrack.file_url);
    }
  }, [currentTrack?.id]);

  useEffect(() => {
    if (!sound) return;
    if (isPlaying) sound.playAsync();
    else sound.pauseAsync();
  }, [isPlaying]);

  const loadTrack = async (uri: string) => {
    if (sound) await sound.unloadAsync();
    const { sound: newSound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: true }
    );
    setSound(newSound);
    newSound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && !isSeeking) {
        setPosition(status.positionMillis / 1000);
      }
    });
  };

  const handleSeek = async (direction: 'forward' | 'backward') => {
    if (!sound) return;
    const newPos = direction === 'forward' ? position + 10 : position - 10;
    await sound.setPositionAsync(Math.max(0, newPos) * 1000);
  };

  if (!currentTrack) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No track selected</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.artContainer}>
        {currentTrack.album_cover_url ? (
          <Image source={{ uri: currentTrack.album_cover_url }} style={styles.albumArt} />
        ) : (
          <View style={styles.placeholderArt}>
            <Text style={styles.placeholderText}>{currentTrack.title[0]}</Text>
          </View>
        )}
      </View>

      <Text style={styles.trackTitle}>{currentTrack.title}</Text>
      <Text style={styles.artistName}>{currentTrack.artist_name}</Text>

      <View style={styles.progressContainer}>
        <Text style={styles.time}>{formatDuration(position)}</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(position / currentTrack.duration) * 100}%` }]} />
        </View>
        <Text style={styles.time}>{formatDuration(currentTrack.duration)}</Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity onPress={() => handleSeek('backward')} style={styles.controlBtn}>
          <Text style={styles.controlText}>⏪</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={previous} style={styles.controlBtn}>
          <Text style={styles.controlText}>⏮</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => (isPlaying ? pause() : resume())} style={styles.playBtn}>
          <Text style={styles.playText}>{isPlaying ? '⏸' : '▶'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={next} style={styles.controlBtn}>
          <Text style={styles.controlText}>⏭</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleSeek('forward')} style={styles.controlBtn}>
          <Text style={styles.controlText}>⏩</Text>
        </TouchableOpacity>
      </View>

      {queue.length > 1 && (
        <View style={styles.queueSection}>
          <Text style={styles.queueTitle}>Up Next</Text>
          <ScrollView style={styles.queueList}>
            {queue.slice(queueIndex + 1).map((track, i) => (
              <View key={track.id} style={styles.queueItem}>
                <Text style={styles.queueIndex}>{String(i + 1).padStart(2, '0')}</Text>
                <View style={styles.queueTrackInfo}>
                  <Text style={styles.queueTrackTitle} numberOfLines={1}>{track.title}</Text>
                  <Text style={styles.queueArtist}>{track.artist_name}</Text>
                </View>
                <Text style={styles.queueDuration}>{formatDuration(track.duration)}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F0', padding: 24, paddingTop: 60 },
  emptyContainer: { flex: 1, backgroundColor: '#F5F5F0', justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontFamily: 'monospace', opacity: 0.5 },
  artContainer: { alignItems: 'center', marginBottom: 32 },
  albumArt: { width: 250, height: 250, borderWidth: 3, borderColor: '#000', shadowColor: '#000', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0 },
  placeholderArt: { width: 250, height: 250, borderWidth: 3, borderColor: '#000', backgroundColor: '#FFD700', justifyContent: 'center', alignItems: 'center' },
  placeholderText: { fontSize: 80, fontWeight: '900' },
  trackTitle: { fontSize: 22, fontWeight: '900', textAlign: 'center' },
  artistName: { fontSize: 14, fontFamily: 'monospace', opacity: 0.6, textAlign: 'center', marginTop: 4 },
  progressContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 24, gap: 8 },
  progressBar: { flex: 1, height: 6, backgroundColor: '#ddd', borderWidth: 2, borderColor: '#000' },
  progressFill: { height: '100%', backgroundColor: '#000' },
  time: { fontFamily: 'monospace', fontSize: 11 },
  controls: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24, gap: 12 },
  controlBtn: { width: 48, height: 48, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#000', backgroundColor: '#fff' },
  controlText: { fontSize: 18 },
  playBtn: { width: 64, height: 64, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#000', backgroundColor: '#FFD700' },
  playText: { fontSize: 24 },
  queueSection: { marginTop: 32, flex: 1 },
  queueTitle: { fontSize: 14, fontWeight: '900', textTransform: 'uppercase', marginBottom: 8, fontFamily: 'monospace' },
  queueList: { flex: 1 },
  queueItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#ddd' },
  queueIndex: { width: 24, fontFamily: 'monospace', fontSize: 11, opacity: 0.5 },
  queueTrackInfo: { flex: 1, marginLeft: 8 },
  queueTrackTitle: { fontWeight: '600', fontSize: 13 },
  queueArtist: { fontSize: 11, fontFamily: 'monospace', opacity: 0.6 },
  queueDuration: { fontFamily: 'monospace', fontSize: 10 },
});