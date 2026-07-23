import { useEffect, useRef, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Animated } from 'react-native';
import { Audio } from 'expo-av';
import { usePlayerStore } from '../stores/playerStore';
import { formatDuration } from '../lib/utils';

const COLORS = ['#FFD700', '#FF6B9D', '#0057FF', '#00D68F', '#B366FF', '#FF9500', '#FF3B30', '#00C7BE'];

function hashColor(title: string): string {
  let hash = 0;
  for (let i = 0; i < title.length; i++) hash = title.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

export function PlayerScreen() {
  const {
    currentTrack, isPlaying, queue, queueIndex, repeat, autoPlay, shuffle,
    play, pause, resume, next, previous, cycleRepeat, toggleAutoPlay, toggleShuffle,
  } = usePlayerStore();
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [position, setPosition] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const spinAnim = useRef(new Animated.Value(0)).current;
  const accent = currentTrack ? hashColor(currentTrack.title) : '#FFD700';

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

  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinAnim.stopAnimation();
    }
    return () => spinAnim.stopAnimation();
  }, [isPlaying]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

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

  const handleSliderChange = async (value: number) => {
    setIsSeeking(true);
    if (sound) await sound.setPositionAsync(value * 1000);
    setPosition(value);
    setIsSeeking(false);
  };

  if (!currentTrack) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>&#9835;</Text>
          <Text style={styles.emptyText}>No track selected</Text>
          <Text style={styles.emptySub}>Search for a track to start listening</Text>
        </View>
      </View>
    );
  }

  const progressPct = currentTrack.duration > 0 ? (position / currentTrack.duration) * 100 : 0;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.artWrapper}>
          <Animated.View style={[styles.artContainer, { transform: [{ rotate: spin }] }]}>
            {currentTrack.album_cover_url ? (
              <Image source={{ uri: currentTrack.album_cover_url }} style={styles.albumArt} />
            ) : (
              <View style={[styles.placeholderArt, { backgroundColor: accent }]}>
                <View style={styles.cdHole}>
                  <View style={[styles.cdInner, { backgroundColor: accent }]} />
                </View>
                <Text style={styles.cdLabel} numberOfLines={2}>
                  {currentTrack.title.split(' ').slice(0, 3).join(' ').substring(0, 15)}
                </Text>
              </View>
            )}
          </Animated.View>
          <View style={[styles.playingIndicator, isPlaying && styles.playingActive]} />
        </View>

        <View style={styles.trackInfo}>
          <Text style={styles.trackTitle} numberOfLines={1}>{currentTrack.title}</Text>
          <Text style={styles.artistName} numberOfLines={1}>{currentTrack.artist_name}</Text>
          {currentTrack.album_title && (
            <Text style={styles.albumTitle} numberOfLines={1}>{currentTrack.album_title}</Text>
          )}
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressContainer}>
            <View style={[styles.progressFill, { width: `${progressPct}%`, backgroundColor: accent }]} />
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.time}>{formatDuration(position)}</Text>
            <Text style={styles.time}>{formatDuration(currentTrack.duration)}</Text>
          </View>
        </View>

        <View style={styles.controlsRow}>
          <TouchableOpacity onPress={toggleShuffle} style={[styles.modeBtn, shuffle && styles.modeBtnActive]}>
            <Text style={[styles.modeBtnText, shuffle && styles.modeBtnTextActive]}>&#8645;</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={previous} style={styles.controlBtn}>
            <Text style={styles.controlText}>&#9646;&#9644;</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => (isPlaying ? pause() : resume())} style={[styles.playBtn, { backgroundColor: accent }]}>
            <Text style={styles.playText}>{isPlaying ? '\u23F8' : '\u25B6'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={next} style={styles.controlBtn}>
            <Text style={styles.controlText}>&#9644;&#9646;</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={cycleRepeat} style={[styles.modeBtn, repeat !== 'off' && styles.modeBtnActive]}>
            <Text style={[styles.modeBtnText, repeat !== 'off' && styles.modeBtnTextActive]}>
              {repeat === 'one' ? '1' : '\u21BB'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.modeRow}>
          <TouchableOpacity onPress={toggleAutoPlay} style={[styles.tag, autoPlay && styles.tagActive]}>
            <Text style={[styles.tagText, autoPlay && styles.tagTextActive]}>Auto</Text>
          </TouchableOpacity>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{formatDuration(currentTrack.duration)}</Text>
          </View>
          {currentTrack.source === 'youtube' && (
            <View style={[styles.tag, { backgroundColor: '#FF3B30', borderColor: '#000' }]}>
              <Text style={[styles.tagText, { color: '#fff' }]}>YT</Text>
            </View>
          )}
        </View>

        {queue.length > 1 && (
          <View style={styles.queueSection}>
            <View style={styles.queueHeader}>
              <Text style={styles.queueTitle}>Up Next</Text>
              <Text style={styles.queueCount}>{queue.slice(queueIndex + 1).length} tracks</Text>
            </View>
            {queue.slice(queueIndex + 1).map((track, i) => (
              <TouchableOpacity
                key={track.id}
                style={styles.queueItem}
                onPress={() => play(track)}
              >
                <View style={[styles.queueNumber, { backgroundColor: hashColor(track.title) }]}>
                  <Text style={styles.queueNumberText}>{String(i + 1).padStart(2, '0')}</Text>
                </View>
                <View style={styles.queueTrackInfo}>
                  <Text style={styles.queueTrackTitle} numberOfLines={1}>{track.title}</Text>
                  <Text style={styles.queueArtist} numberOfLines={1}>{track.artist_name}</Text>
                </View>
                <Text style={styles.queueDuration}>{formatDuration(track.duration)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', paddingTop: 60 },
  scrollContent: { padding: 24, paddingBottom: 40 },
  emptyContainer: { flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyBox: { borderWidth: 3, borderColor: '#333', padding: 40, alignItems: 'center', backgroundColor: '#1e1e1e', shadowColor: '#222', shadowOffset: { width: 6, height: 6 }, shadowOpacity: 1, shadowRadius: 0 },
  emptyIcon: { fontSize: 48, color: '#FFD700', marginBottom: 16 },
  emptyText: { fontSize: 18, fontWeight: '900', color: '#e0d8c8', textTransform: 'uppercase' },
  emptySub: { fontSize: 11, fontFamily: 'monospace', opacity: 0.4, color: '#e0d8c8', marginTop: 8, textAlign: 'center' },

  artWrapper: { alignItems: 'center', marginBottom: 32, position: 'relative' },
  artContainer: { width: 260, height: 260, borderWidth: 3, borderColor: '#333', shadowColor: '#222', shadowOffset: { width: 6, height: 6 }, shadowOpacity: 1, shadowRadius: 0, overflow: 'hidden' },
  albumArt: { width: '100%', height: '100%' },
  placeholderArt: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  cdHole: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#1e1e1e', borderWidth: 2, borderColor: '#333', justifyContent: 'center', alignItems: 'center', position: 'absolute', zIndex: 2 },
  cdInner: { width: 20, height: 20, borderRadius: 10 },
  cdLabel: { position: 'absolute', fontSize: 16, fontWeight: '900', color: '#000', textTransform: 'uppercase', textAlign: 'center', maxWidth: '60%' },
  playingIndicator: { position: 'absolute', bottom: -8, right: 20, width: 16, height: 16, borderRadius: 8, backgroundColor: '#333', borderWidth: 2, borderColor: '#444' },
  playingActive: { backgroundColor: '#00D68F', borderColor: '#000' },

  trackInfo: { marginBottom: 24 },
  trackTitle: { fontSize: 26, fontWeight: '900', color: '#e0d8c8', textTransform: 'uppercase', textAlign: 'center' },
  artistName: { fontSize: 14, fontFamily: 'monospace', color: '#e0d8c8', opacity: 0.6, textAlign: 'center', marginTop: 6 },
  albumTitle: { fontSize: 11, fontFamily: 'monospace', color: '#e0d8c8', opacity: 0.3, textAlign: 'center', marginTop: 4 },

  progressSection: { marginBottom: 24 },
  progressContainer: { height: 8, backgroundColor: '#333', borderWidth: 2, borderColor: '#444' },
  progressFill: { height: '100%' },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  time: { fontFamily: 'monospace', fontSize: 11, color: '#e0d8c8', opacity: 0.4 },

  controlsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, marginBottom: 16 },
  controlBtn: { width: 52, height: 52, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#333', backgroundColor: '#1e1e1e', shadowColor: '#222', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0 },
  controlText: { fontSize: 18, color: '#e0d8c8' },
  playBtn: { width: 72, height: 72, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#333', shadowColor: '#222', shadowOffset: { width: 5, height: 5 }, shadowOpacity: 1, shadowRadius: 0 },
  playText: { fontSize: 28, color: '#000', fontWeight: '900' },
  modeBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#333', backgroundColor: '#1e1e1e' },
  modeBtnActive: { backgroundColor: '#FFD700', borderColor: '#000' },
  modeBtnText: { fontSize: 14, color: '#e0d8c8', opacity: 0.5 },
  modeBtnTextActive: { color: '#000', opacity: 1 },

  modeRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 24 },
  tag: { paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1.5, borderColor: '#444', backgroundColor: '#2a2a2a' },
  tagActive: { backgroundColor: '#00D68F', borderColor: '#000' },
  tagText: { fontFamily: 'monospace', fontSize: 10, color: '#bbb', textTransform: 'uppercase', letterSpacing: 1 },
  tagTextActive: { color: '#000', fontWeight: '700' },

  queueSection: { marginTop: 8 },
  queueHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 8, borderBottomWidth: 2, borderBottomColor: '#333' },
  queueTitle: { fontSize: 14, fontWeight: '900', color: '#e0d8c8', textTransform: 'uppercase' },
  queueCount: { fontFamily: 'monospace', fontSize: 10, color: '#e0d8c8', opacity: 0.4, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1.5, borderColor: '#444' },
  queueItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#2a2a2a' },
  queueNumber: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#333', marginRight: 12 },
  queueNumberText: { fontFamily: 'monospace', fontSize: 11, fontWeight: '900', color: '#000' },
  queueTrackInfo: { flex: 1, marginLeft: 4 },
  queueTrackTitle: { fontWeight: '700', fontSize: 13, color: '#e0d8c8', textTransform: 'uppercase' },
  queueArtist: { fontSize: 11, fontFamily: 'monospace', color: '#e0d8c8', opacity: 0.5, marginTop: 2 },
  queueDuration: { fontFamily: 'monospace', fontSize: 10, color: '#e0d8c8', opacity: 0.4 },
});
