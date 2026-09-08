import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { characters, houses, type House } from '../lib/tidefall';
import { emptyProgress, levelFromPoints, loadProgress, saveProgress, titleFromProgress, updateProfile, type TidefallProgress } from '../lib/progress';
import { achievements, quests, reconcileAchievements, secrets } from '../lib/world';

export default function ProfileScreen() {
  const [progress, setProgress] = useState<TidefallProgress>(emptyProgress);

  useFocusEffect(useCallback(() => {
    let active = true;
    loadProgress().then(async (loaded) => {
      const next = reconcileAchievements(loaded);
      if (next !== loaded) await saveProgress(next);
      if (active) setProgress(next);
    });
    return () => { active = false; };
  }, []));

  async function applyProfile(patch: Partial<TidefallProgress['profile']>) {
    const next = updateProfile(progress, patch);
    await saveProgress(next);
    setProgress(next);
  }

  async function chooseHouse(house: House) { await applyProfile({ house }); }
  async function chooseFavourite(favourite: string) { await applyProfile({ favourite }); }
  async function chooseTitle(title: string) { await applyProfile({ title }); }

  const level = levelFromPoints(progress.tidePoints);
  const levelStart = (level - 1) * 250;
  const levelProgress = Math.min(100, ((progress.tidePoints - levelStart) / 250) * 100);
  const spellsCast = Object.values(progress.spellMastery).filter((value) => value > 0).length;
  const title = titleFromProgress(progress);

  const earnedTitles = useMemo(() => {
    const values = ['First Year'];
    if (progress.discoveries.length >= 5) values.push('Current Chaser');
    if (Object.values(progress.spellMastery).some((value) => value >= 50)) values.push('Spell Trainee');
    if (progress.discoveredRooms.length >= 5) values.push('Academy Cartographer');
    if (progress.foundSecrets.length >= 4) values.push('Secret Keeper');
    if (progress.completedQuests.length >= 3) values.push('Tidewalker');
    return Array.from(new Set(values));
  }, [progress]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>YOU</Text>
        <Text style={styles.title}>Your Tidefall</Text>
        <Text style={styles.body}>Rooms, spells, quests, secrets and story progress all feed one identity. This is the save file for your pocket version of Tidefall.</Text>

        <View style={styles.identityCard}>
          <View style={styles.levelCircle}><Text style={styles.levelNumber}>{level}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.identityLabel}>ACADEMY IDENTITY</Text><Text style={styles.identityTitle}>{title}</Text><Text style={styles.identityHouse}>{progress.profile.house || 'House not chosen yet'}</Text>
            <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${Math.max(4, levelProgress)}%` }]} /></View>
            <Text style={styles.levelCopy}>{progress.tidePoints} Tide Points · {Math.max(0, level * 250 - progress.tidePoints)} to level {level + 1}</Text>
          </View>
        </View>

        <View style={styles.stats}>
          <TouchableOpacity style={styles.stat} onPress={() => router.push('/academy')}><Text style={styles.statNumber}>{progress.discoveredRooms.length}</Text><Text style={styles.statLabel}>ROOMS</Text></TouchableOpacity>
          <TouchableOpacity style={styles.stat} onPress={() => router.push('/magic')}><Text style={styles.statNumber}>{progress.totalCasts}</Text><Text style={styles.statLabel}>CASTS</Text></TouchableOpacity>
          <TouchableOpacity style={styles.stat} onPress={() => router.push('/secrets')}><Text style={styles.statNumber}>{progress.foundSecrets.length}</Text><Text style={styles.statLabel}>SECRETS</Text></TouchableOpacity>
          <TouchableOpacity style={styles.stat} onPress={() => router.push('/quests')}><Text style={styles.statNumber}>{progress.completedQuests.length}</Text><Text style={styles.statLabel}>QUESTS</Text></TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Your House</Text>
        <View style={styles.chips}>{houses.map((house) => <TouchableOpacity key={house} onPress={() => chooseHouse(house)} style={[styles.chip, progress.profile.house === house && styles.chipActive]}><Text style={[styles.chipText, progress.profile.house === house && styles.chipTextActive]}>{house}</Text></TouchableOpacity>)}</View>

        <Text style={styles.sectionTitle}>Displayed title</Text>
        <Text style={styles.sectionBody}>Titles unlock from what you actually do. Pick which earned title appears across the app.</Text>
        <View style={styles.chips}>{earnedTitles.map((earned) => <TouchableOpacity key={earned} onPress={() => chooseTitle(earned)} style={[styles.chip, title === earned && styles.chipActive]}><Text style={[styles.chipText, title === earned && styles.chipTextActive]}>{earned}</Text></TouchableOpacity>)}</View>

        <Text style={styles.sectionTitle}>Favourite character</Text>
        <View style={styles.chips}>{characters.map((character) => <TouchableOpacity key={character.slug} onPress={() => chooseFavourite(character.name)} style={[styles.chip, progress.profile.favourite === character.name && styles.chipActive]}><Text style={[styles.chipText, progress.profile.favourite === character.name && styles.chipTextActive]}>{character.name}</Text></TouchableOpacity>)}</View>

        <Text style={styles.sectionTitle}>Your collection</Text>
        <View style={styles.collectionGrid}>
          <TouchableOpacity style={styles.collectionCard} onPress={() => router.push('/academy')}><Text style={styles.collectionGlyph}>⌁</Text><Text style={styles.collectionValue}>{progress.discoveredRooms.length}</Text><Text style={styles.collectionLabel}>ACADEMY ROOMS</Text></TouchableOpacity>
          <TouchableOpacity style={styles.collectionCard} onPress={() => router.push('/magic')}><Text style={styles.collectionGlyph}>✦</Text><Text style={styles.collectionValue}>{spellsCast}</Text><Text style={styles.collectionLabel}>KNOWN SPELLS</Text></TouchableOpacity>
          <TouchableOpacity style={styles.collectionCard} onPress={() => router.push('/secrets')}><Text style={styles.collectionGlyph}>?</Text><Text style={styles.collectionValue}>{progress.foundSecrets.length}/{secrets.length}</Text><Text style={styles.collectionLabel}>SECRETS</Text></TouchableOpacity>
          <TouchableOpacity style={styles.collectionCard} onPress={() => router.push('/quests')}><Text style={styles.collectionGlyph}>☷</Text><Text style={styles.collectionValue}>{progress.completedQuests.length}/{quests.length}</Text><Text style={styles.collectionLabel}>QUESTS</Text></TouchableOpacity>
          <TouchableOpacity style={styles.collectionCard} onPress={() => router.push('/achievements')}><Text style={styles.collectionGlyph}>◎</Text><Text style={styles.collectionValue}>{progress.unlockedAchievements.length}/{achievements.length}</Text><Text style={styles.collectionLabel}>ACHIEVEMENTS</Text></TouchableOpacity>
          <TouchableOpacity style={styles.collectionCard} onPress={() => router.push('/books')}><Text style={styles.collectionGlyph}>▤</Text><Text style={styles.collectionValue}>{progress.reading.bookOnePercent}%</Text><Text style={styles.collectionLabel}>BOOK ONE</Text></TouchableOpacity>
        </View>

        <View style={styles.portalRow}>
          <TouchableOpacity style={styles.portal} onPress={() => router.push('/quests')}><Text style={styles.portalLabel}>QUEST LOG</Text><Text style={styles.portalTitle}>What should I do?</Text><Text style={styles.portalArrow}>›</Text></TouchableOpacity>
          <TouchableOpacity style={styles.portal} onPress={() => router.push('/achievements')}><Text style={styles.portalLabel}>CABINET</Text><Text style={styles.portalTitle}>What did I unlock?</Text><Text style={styles.portalArrow}>›</Text></TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Recent discoveries</Text>
        {progress.discoveries.length ? progress.discoveries.slice(0, 8).map((item, index) => (
          <View key={item.id} style={styles.recent}><View style={styles.recentIndex}><Text style={styles.recentIndexText}>{index + 1}</Text></View><View style={{ flex: 1 }}><Text style={styles.recentText}>{item.title}</Text><Text style={styles.recentKind}>{item.kind.toUpperCase()}</Text></View></View>
        )) : <View style={styles.empty}><Text style={styles.emptyTitle}>Your collection is empty.</Text><Text style={styles.emptyBody}>Enter a room, cast a spell or follow a current. Tidefall will remember it.</Text></View>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#06141E' }, content: { padding: 20, paddingBottom: 120 }, kicker: { color: '#79E2F5', fontWeight: '900', letterSpacing: 2.2, fontSize: 10, marginTop: 10 }, title: { color: '#F3FBFE', fontSize: 36, lineHeight: 41, fontWeight: '900', marginTop: 7 }, body: { color: '#9DB3BE', fontSize: 14, lineHeight: 21, marginTop: 8 },
  identityCard: { marginTop: 23, borderRadius: 27, borderWidth: 1, borderColor: '#1D4B5B', backgroundColor: '#0A2532', padding: 19, flexDirection: 'row', alignItems: 'center', gap: 15 }, levelCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#C7F6FF', alignItems: 'center', justifyContent: 'center' }, levelNumber: { color: '#06212C', fontSize: 28, fontWeight: '900' }, identityLabel: { color: '#78DDF1', fontSize: 8, fontWeight: '900', letterSpacing: 1.6 }, identityTitle: { color: '#F3FBFD', fontSize: 19, fontWeight: '900', marginTop: 4 }, identityHouse: { color: '#90AAB5', fontSize: 10, fontWeight: '800', marginTop: 3 }, progressTrack: { height: 7, borderRadius: 99, backgroundColor: '#153744', overflow: 'hidden', marginTop: 10 }, progressFill: { height: '100%', borderRadius: 99, backgroundColor: '#9DEBFB' }, levelCopy: { color: '#738F9A', fontSize: 9, marginTop: 6 },
  stats: { flexDirection: 'row', gap: 6, marginTop: 11 }, stat: { flex: 1, minHeight: 76, borderRadius: 18, borderWidth: 1, borderColor: '#173B49', backgroundColor: '#081D28', alignItems: 'center', justifyContent: 'center', padding: 4 }, statNumber: { color: '#F3FBFD', fontSize: 18, fontWeight: '900' }, statLabel: { color: '#70909C', fontSize: 7, fontWeight: '900', letterSpacing: 0.8, marginTop: 4 },
  sectionTitle: { color: '#F4FBFD', fontSize: 20, fontWeight: '900', marginTop: 28 }, sectionBody: { color: '#839EA9', fontSize: 11, lineHeight: 17, marginTop: 5 }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }, chip: { borderRadius: 999, borderWidth: 1, borderColor: '#1B4050', backgroundColor: '#081D28', paddingHorizontal: 14, paddingVertical: 10 }, chipActive: { backgroundColor: '#C7F6FF', borderColor: '#C7F6FF' }, chipText: { color: '#9DB3BE', fontSize: 10, fontWeight: '900' }, chipTextActive: { color: '#06212C' },
  collectionGrid: { marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 }, collectionCard: { width: '48%', minHeight: 118, borderRadius: 22, borderWidth: 1, borderColor: '#173B49', backgroundColor: '#081D28', padding: 15 }, collectionGlyph: { color: '#86E7F8', fontSize: 24 }, collectionValue: { color: '#F4FBFD', fontSize: 20, fontWeight: '900', marginTop: 10 }, collectionLabel: { color: '#6E8B96', fontSize: 8, fontWeight: '900', letterSpacing: 1, marginTop: 3 },
  portalRow: { flexDirection: 'row', gap: 10, marginTop: 12 }, portal: { flex: 1, minHeight: 105, borderRadius: 21, borderWidth: 1, borderColor: '#1C4554', backgroundColor: '#09222D', padding: 14, paddingRight: 30 }, portalLabel: { color: '#70DCEF', fontSize: 7, fontWeight: '900', letterSpacing: 1.3 }, portalTitle: { color: '#EFF9FC', fontSize: 14, lineHeight: 18, fontWeight: '900', marginTop: 5 }, portalArrow: { position: 'absolute', right: 10, bottom: 10, color: '#77DFF2', fontSize: 24 },
  recent: { minHeight: 66, marginTop: 9, borderRadius: 18, borderWidth: 1, borderColor: '#173B49', backgroundColor: '#081D28', paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }, recentIndex: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#0F3140', alignItems: 'center', justifyContent: 'center' }, recentIndexText: { color: '#7CE2F5', fontSize: 11, fontWeight: '900' }, recentText: { color: '#E9F7FA', fontSize: 12, fontWeight: '900' }, recentKind: { color: '#6D8B96', fontSize: 7, fontWeight: '900', letterSpacing: 1.1, marginTop: 3 }, empty: { marginTop: 10, borderRadius: 20, borderWidth: 1, borderColor: '#173B49', backgroundColor: '#081D28', padding: 18 }, emptyTitle: { color: '#F3FBFD', fontSize: 15, fontWeight: '900' }, emptyBody: { color: '#839EA9', fontSize: 11, lineHeight: 17, marginTop: 5 },
});
