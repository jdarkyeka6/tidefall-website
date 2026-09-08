import { useEffect, useState } from 'react';
import { NativeSyntheticEvent, NativeScrollEvent, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { emptyProgress, loadProgress, recordSecret, saveProgress, updateReading, type TidefallProgress } from '../lib/progress';
import { reconcileAchievements, secrets } from '../lib/world';
import { router } from 'expo-router';

const preview = [
  'Jasper Holloway was underwater, but he could breathe.',
  'That was the first thing that was wrong.',
  'The second was the silence.',
  'There were no gulls. No wind. No fizz of foam collapsing against sand. Even the water around him made no sound.',
  'Jasper looked up. There should have been sunlight somewhere above him. Instead there was only a pale silver haze.',
  'He tried to swim upward. His arms moved. His legs kicked. The silver haze did not come any closer.',
  'Something shifted below.',
  'Jasper went still.',
  'It was not a fish.',
  'Whatever moved beneath him was slower than that. The darkness itself seemed to change shape, as though some enormous part of it had decided to face another direction.',
  'A pressure passed through his chest. Not pain. Not a voice. Attention.',
  'Then something answered from below.',
];

export default function BooksScreen() {
  const [progress, setProgress] = useState<TidefallProgress>(emptyProgress);
  const [loaded, setLoaded] = useState(false);
  const [reading, setReading] = useState(false);
  const [lastSaved, setLastSaved] = useState(0);
  const storySecret = secrets.find((secret) => secret.slug === 'silver-margin');
  const secretFound = storySecret ? progress.foundSecrets.includes(storySecret.slug) : false;

  useEffect(() => {
    let active = true;
    loadProgress().then((current) => {
      if (!active) return;
      setProgress(current);
      setLastSaved(current.reading.bookOnePercent);
      setLoaded(true);
    });
    return () => { active = false; };
  }, []);

  async function ensureLoaded() {
    if (loaded) return progress;
    const current = await loadProgress();
    setProgress(current);
    setLoaded(true);
    setLastSaved(current.reading.bookOnePercent);
    return current;
  }

  async function openReader() {
    await ensureLoaded();
    setReading(true);
  }

  async function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    if (!reading) return;
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
    if (contentSize.height <= 0) return;
    const ratio = Math.min(1, (contentOffset.y + layoutMeasurement.height) / contentSize.height);
    const previewPercent = Math.max(1, Math.round(ratio * 10));
    if (previewPercent <= lastSaved) return;
    const base = loaded ? progress : await ensureLoaded();
    let next = updateReading(base, previewPercent);
    if (previewPercent >= 10 && storySecret && !next.foundSecrets.includes(storySecret.slug)) {
      next = recordSecret(next, storySecret.slug, storySecret.title, storySecret.points);
    }
    next = reconcileAchievements(next);
    await saveProgress(next);
    setProgress(next);
    setLastSaved(previewPercent);
  }

  return (
    <LinearGradient colors={['#041019', '#0A202B', '#041019']} style={styles.bg}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} onScroll={handleScroll} scrollEventThrottle={250}>
          <Text style={styles.kicker}>THE STORY</Text>
          <Text style={styles.title}>Books</Text>
          <Text style={styles.body}>Reading is part of the world now. Story progress advances quests, awards Tide Points and can reveal things outside the obvious reader controls.</Text>

          <View style={styles.bookCard}>
            <LinearGradient colors={['#173748', '#07131F']} style={styles.cover}><Text style={styles.coverTitle}>TIDEFALL</Text><Text style={styles.coverSub}>BOOK ONE</Text><Text style={styles.coverGlyph}>≈</Text></LinearGradient>
            <View style={styles.bookCopy}>
              <Text style={styles.bookLabel}>BOOK ONE</Text><Text style={styles.bookTitle}>The story begins here.</Text><Text style={styles.bookBody}>Jasper arrives at Tidefall Academy with one very strange dream already following him.</Text>
              <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${Math.max(3, progress.reading.bookOnePercent)}%` }]} /></View>
              <Text style={styles.progressText}>{progress.reading.bookOnePercent}% story progress</Text>
              <TouchableOpacity style={styles.readButton} activeOpacity={0.86} onPress={openReader}><Text style={styles.readButtonText}>{reading ? 'CONTINUE BELOW' : 'READ NATIVE PREVIEW'}</Text></TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.questCard} activeOpacity={0.86} onPress={() => router.push('/quests')}>
            <Text style={styles.questLabel}>STORY QUEST</Text><Text style={styles.questTitle}>Words Change the Map</Text><Text style={styles.questBody}>Reading milestones are now quest steps. Reach the end of this preview to complete the current reading objective.</Text><Text style={styles.questArrow}>›</Text>
          </TouchableOpacity>

          <View style={styles.shelfRow}>
            <View style={styles.shelfCard}><Text style={styles.shelfNumber}>II</Text><Text style={styles.shelfTitle}>Book Two</Text><Text style={styles.shelfStatus}>Story shelf</Text></View>
            <View style={styles.shelfCard}><Text style={styles.shelfNumber}>III</Text><Text style={styles.shelfTitle}>Book Three</Text><Text style={styles.shelfStatus}>Story shelf</Text></View>
          </View>

          {secretFound && storySecret && (
            <TouchableOpacity style={styles.secretBanner} activeOpacity={0.86} onPress={() => router.push('/secrets')}>
              <Text style={styles.secretGlyph}>?</Text><View style={{ flex: 1 }}><Text style={styles.secretLabel}>STORY SECRET FOUND</Text><Text style={styles.secretTitle}>{storySecret.title}</Text><Text style={styles.secretBody}>{storySecret.clue}</Text></View><Text style={styles.secretArrow}>›</Text>
            </TouchableOpacity>
          )}

          {reading && (
            <View style={styles.reader}>
              <Text style={styles.readerKicker}>BOOK ONE · FREE PREVIEW</Text><Text style={styles.readerTitle}>Chapter One</Text><Text style={styles.chapterTitle}>THE WATER WITHOUT A SKY</Text>
              {preview.map((paragraph, index) => <Text key={index} style={styles.paragraph}>{paragraph}</Text>)}
              <View style={styles.previewEnd}>
                <Text style={styles.previewEndLabel}>END OF NATIVE PREVIEW</Text><Text style={styles.previewEndTitle}>Your place is saved.</Text><Text style={styles.previewEndBody}>Reaching this point completes the 10% story milestone, advances the story quest and reveals a hidden entry in the Secret Archive.</Text>
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 }, safe: { flex: 1 }, content: { padding: 20, paddingBottom: 120 }, kicker: { color: '#79E2F5', fontSize: 10, fontWeight: '900', letterSpacing: 2.3, marginTop: 10 }, title: { color: '#F5FCFF', fontSize: 42, fontWeight: '900', marginTop: 7 }, body: { color: '#9DB3BE', fontSize: 14, lineHeight: 21, marginTop: 8 },
  bookCard: { marginTop: 25, borderRadius: 28, borderWidth: 1, borderColor: '#214653', backgroundColor: '#081D28', padding: 14, flexDirection: 'row', gap: 16 }, cover: { width: 118, aspectRatio: 0.68, borderRadius: 20, borderWidth: 1, borderColor: '#315665', padding: 13, justifyContent: 'space-between' }, coverTitle: { color: '#F4FBFD', fontSize: 15, fontWeight: '900', letterSpacing: 2 }, coverSub: { color: '#91BBC7', fontSize: 9, fontWeight: '800', letterSpacing: 1.6 }, coverGlyph: { color: '#82E8FA', fontSize: 33 },
  bookCopy: { flex: 1, paddingVertical: 5 }, bookLabel: { color: '#77DDF1', fontSize: 9, fontWeight: '900', letterSpacing: 1.5 }, bookTitle: { color: '#F4FBFD', fontSize: 21, lineHeight: 26, fontWeight: '900', marginTop: 6 }, bookBody: { color: '#8FA9B4', fontSize: 12, lineHeight: 18, marginTop: 6 }, progressTrack: { height: 7, borderRadius: 99, backgroundColor: '#153744', overflow: 'hidden', marginTop: 14 }, progressFill: { height: '100%', borderRadius: 99, backgroundColor: '#9DEBFB' }, progressText: { color: '#78939E', fontSize: 10, fontWeight: '800', marginTop: 6 }, readButton: { marginTop: 12, alignSelf: 'flex-start', borderRadius: 14, backgroundColor: '#C7F6FF', paddingHorizontal: 13, paddingVertical: 10 }, readButtonText: { color: '#06212C', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  questCard: { marginTop: 12, borderRadius: 22, borderWidth: 1, borderColor: '#214A59', backgroundColor: '#09222D', padding: 16, paddingRight: 45 }, questLabel: { color: '#75DDF1', fontSize: 8, fontWeight: '900', letterSpacing: 1.5 }, questTitle: { color: '#F3FBFD', fontSize: 17, fontWeight: '900', marginTop: 4 }, questBody: { color: '#819DA8', fontSize: 10, lineHeight: 15, marginTop: 4 }, questArrow: { position: 'absolute', right: 16, top: 29, color: '#7EE3F5', fontSize: 28 },
  shelfRow: { flexDirection: 'row', gap: 10, marginTop: 12 }, shelfCard: { flex: 1, minHeight: 112, borderRadius: 22, borderWidth: 1, borderColor: '#173A48', backgroundColor: '#071B25', padding: 16 }, shelfNumber: { color: '#6FD9ED', fontSize: 22, fontWeight: '300' }, shelfTitle: { color: '#DDECF1', fontSize: 14, fontWeight: '900', marginTop: 10 }, shelfStatus: { color: '#718B96', fontSize: 10, marginTop: 4 },
  secretBanner: { marginTop: 12, borderRadius: 22, borderWidth: 1, borderStyle: 'dashed', borderColor: '#4C6973', backgroundColor: '#081A22', padding: 15, flexDirection: 'row', gap: 12, alignItems: 'center' }, secretGlyph: { color: '#9AAFB6', fontSize: 28, fontWeight: '900' }, secretLabel: { color: '#748F99', fontSize: 8, fontWeight: '900', letterSpacing: 1.4 }, secretTitle: { color: '#E7F2F5', fontSize: 15, fontWeight: '900', marginTop: 3 }, secretBody: { color: '#778F99', fontSize: 9, lineHeight: 14, marginTop: 3 }, secretArrow: { color: '#829EA8', fontSize: 24 },
  reader: { marginTop: 30, borderTopWidth: 1, borderTopColor: '#1A3B48', paddingTop: 28 }, readerKicker: { color: '#79E2F5', fontSize: 9, fontWeight: '900', letterSpacing: 1.8 }, readerTitle: { color: '#F5FBFD', fontSize: 31, fontWeight: '900', marginTop: 7 }, chapterTitle: { color: '#91B9C5', fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginTop: 7, marginBottom: 24 }, paragraph: { color: '#D7E6EB', fontSize: 17, lineHeight: 29, marginBottom: 20 }, previewEnd: { marginTop: 8, borderRadius: 24, borderWidth: 1, borderColor: '#214A59', backgroundColor: '#09232E', padding: 20 }, previewEndLabel: { color: '#77DDF1', fontSize: 9, fontWeight: '900', letterSpacing: 1.6 }, previewEndTitle: { color: '#F3FBFD', fontSize: 20, fontWeight: '900', marginTop: 6 }, previewEndBody: { color: '#8FAAB5', fontSize: 12, lineHeight: 18, marginTop: 6 },
});
