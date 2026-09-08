import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { emptyProgress, loadProgress, type TidefallProgress } from '../lib/progress';
import { achievements } from '../lib/world';

export default function AchievementsScreen() {
  const [progress, setProgress] = useState<TidefallProgress>(emptyProgress);

  useFocusEffect(useCallback(() => {
    let active = true;
    loadProgress().then((next) => { if (active) setProgress(next); });
    return () => { active = false; };
  }, []));

  const unlocked = progress.unlockedAchievements.length;

  return (
    <LinearGradient colors={['#041019', '#071D28', '#041019']} style={styles.bg}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.back} onPress={() => router.back()}><Text style={styles.backText}>‹</Text></TouchableOpacity>
          <Text style={styles.kicker}>ACHIEVEMENTS</Text>
          <Text style={styles.title}>Proof you were paying attention.</Text>
          <Text style={styles.body}>Some achievements are obvious. Some only reveal themselves after you do something sufficiently questionable.</Text>

          <View style={styles.summary}>
            <View style={styles.ring}><Text style={styles.ringNumber}>{unlocked}</Text></View>
            <View style={{ flex: 1 }}><Text style={styles.summaryLabel}>UNLOCKED</Text><Text style={styles.summaryTitle}>{unlocked} of {achievements.length}</Text><Text style={styles.summaryCopy}>Achievement rewards feed directly back into Tide Points.</Text></View>
          </View>

          <View style={styles.grid}>
            {achievements.map((achievement) => {
              const found = progress.unlockedAchievements.includes(achievement.slug);
              const hidden = achievement.hidden && !found;
              return (
                <View key={achievement.slug} style={[styles.card, found && styles.cardFound, hidden && styles.cardHidden]}>
                  <Text style={[styles.glyph, found && styles.glyphFound]}>{found ? '✓' : hidden ? '?' : '◌'}</Text>
                  <Text style={styles.cardLabel}>{found ? 'UNLOCKED' : hidden ? 'HIDDEN' : 'LOCKED'}</Text>
                  <Text style={styles.cardTitle}>{hidden ? 'Unknown achievement' : achievement.title}</Text>
                  <Text style={styles.cardCopy}>{hidden ? 'There is a way to unlock this. The app is not telling you what it is.' : achievement.description}</Text>
                  <Text style={styles.reward}>{found ? `EARNED +${achievement.reward}` : `REWARD +${achievement.reward}`}</Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 }, safe: { flex: 1 }, content: { padding: 20, paddingBottom: 120 },
  back: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#081D28', borderWidth: 1, borderColor: '#1C4352', alignItems: 'center', justifyContent: 'center' }, backText: { color: '#fff', fontSize: 34, lineHeight: 37, marginTop: -3 },
  kicker: { color: '#79E2F5', fontSize: 10, fontWeight: '900', letterSpacing: 2.3, marginTop: 24 }, title: { color: '#F5FCFF', fontSize: 33, lineHeight: 39, fontWeight: '900', marginTop: 7 }, body: { color: '#96AFBA', fontSize: 14, lineHeight: 21, marginTop: 8 },
  summary: { marginTop: 22, borderRadius: 24, borderWidth: 1, borderColor: '#244F60', backgroundColor: '#0A2531', padding: 17, flexDirection: 'row', alignItems: 'center', gap: 14 }, ring: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#C7F6FF', alignItems: 'center', justifyContent: 'center' }, ringNumber: { color: '#06212C', fontSize: 24, fontWeight: '900' }, summaryLabel: { color: '#76DDF1', fontSize: 8, fontWeight: '900', letterSpacing: 1.5 }, summaryTitle: { color: '#F4FBFD', fontSize: 18, fontWeight: '900', marginTop: 4 }, summaryCopy: { color: '#7E9AA5', fontSize: 10, lineHeight: 15, marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10, marginTop: 16 }, card: { width: '48%', minHeight: 184, borderRadius: 22, borderWidth: 1, borderColor: '#193D4B', backgroundColor: '#081D28', padding: 15 }, cardFound: { borderColor: '#3B7A8D', backgroundColor: '#0A2834' }, cardHidden: { borderStyle: 'dashed', borderColor: '#2B424B', backgroundColor: '#071923' },
  glyph: { color: '#6E8B96', fontSize: 26, fontWeight: '900' }, glyphFound: { color: '#9DEBFB' }, cardLabel: { color: '#6ED9EE', fontSize: 7, fontWeight: '900', letterSpacing: 1.3, marginTop: 11 }, cardTitle: { color: '#EAF6F9', fontSize: 15, lineHeight: 19, fontWeight: '900', marginTop: 4 }, cardCopy: { color: '#78939E', fontSize: 10, lineHeight: 15, marginTop: 5, flex: 1 }, reward: { color: '#72BED0', fontSize: 8, fontWeight: '900', letterSpacing: 0.9, marginTop: 10 },
});
