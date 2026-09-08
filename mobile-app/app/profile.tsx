import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { characters, houses, type House } from '../lib/tidefall';
import { emptyProgress, levelFromPoints, loadProgress, saveProgress, titleFromProgress, updateProfile, type TidefallProgress } from '../lib/progress';

export default function ProfileScreen() {
  const [progress, setProgress] = useState<TidefallProgress>(emptyProgress);

  useFocusEffect(useCallback(() => {
    let active = true;
    loadProgress().then((next) => { if (active) setProgress(next); });
    return () => { active = false; };
  }, []));

  async function chooseHouse(house: House) {
    const next = updateProfile(progress, { house });
    await saveProgress(next);
    setProgress(next);
  }

  async function chooseFavourite(favourite: string) {
    const next = updateProfile(progress, { favourite });
    await saveProgress(next);
    setProgress(next);
  }

  const level = levelFromPoints(progress.tidePoints);
  const levelStart = (level - 1) * 250;
  const levelProgress = Math.min(100, ((progress.tidePoints - levelStart) / 250) * 100);
  const spellsCast = Object.values(progress.spellMastery).filter((value) => value > 0).length;
  const title = titleFromProgress(progress);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>YOU</Text>
        <Text style={styles.title}>Your Tidefall</Text>
        <Text style={styles.body}>This is now your actual progress, not a count of how many links you happened to click.</Text>

        <View style={styles.identityCard}>
          <View style={styles.levelCircle}><Text style={styles.levelNumber}>{level}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.identityLabel}>ACADEMY IDENTITY</Text>
            <Text style={styles.identityTitle}>{title}</Text>
            <Text style={styles.identityHouse}>{progress.profile.house || 'House not chosen yet'}</Text>
            <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${Math.max(4, levelProgress)}%` }]} /></View>
            <Text style={styles.levelCopy}>{progress.tidePoints} Tide Points · {Math.max(0, level * 250 - progress.tidePoints)} to level {level + 1}</Text>
          </View>
        </View>

        <View style={styles.stats}>
          <TouchableOpacity style={styles.stat} onPress={() => router.push('/academy')}><Text style={styles.statNumber}>{progress.discoveredRooms.length}</Text><Text style={styles.statLabel}>ROOMS</Text></TouchableOpacity>
          <TouchableOpacity style={styles.stat} onPress={() => router.push('/magic')}><Text style={styles.statNumber}>{spellsCast}</Text><Text style={styles.statLabel}>SPELLS</Text></TouchableOpacity>
          <TouchableOpacity style={styles.stat} onPress={() => router.push('/explore')}><Text style={styles.statNumber}>{progress.discoveries.length}</Text><Text style={styles.statLabel}>DISCOVERIES</Text></TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Your House</Text>
        <Text style={styles.sectionBody}>Pick the House shown on your profile. The old placeholder options have been removed.</Text>
        <View style={styles.chips}>
          {houses.map((house) => (
            <TouchableOpacity key={house} onPress={() => chooseHouse(house)} style={[styles.chip, progress.profile.house === house && styles.chipActive]}>
              <Text style={[styles.chipText, progress.profile.house === house && styles.chipTextActive]}>{house}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Favourite character</Text>
        <View style={styles.chips}>
          {characters.map((character) => (
            <TouchableOpacity key={character.slug} onPress={() => chooseFavourite(character.name)} style={[styles.chip, progress.profile.favourite === character.name && styles.chipActive]}>
              <Text style={[styles.chipText, progress.profile.favourite === character.name && styles.chipTextActive]}>{character.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Collection</Text>
        <View style={styles.collectionGrid}>
          <View style={styles.collectionCard}><Text style={styles.collectionGlyph}>⌁</Text><Text style={styles.collectionValue}>{progress.discoveredRooms.length}</Text><Text style={styles.collectionLabel}>ACADEMY ROOMS</Text></View>
          <View style={styles.collectionCard}><Text style={styles.collectionGlyph}>✦</Text><Text style={styles.collectionValue}>{spellsCast}</Text><Text style={styles.collectionLabel}>SPELLS CAST</Text></View>
          <View style={styles.collectionCard}><Text style={styles.collectionGlyph}>▤</Text><Text style={styles.collectionValue}>{progress.reading.bookOnePercent}%</Text><Text style={styles.collectionLabel}>BOOK ONE</Text></View>
          <View style={styles.collectionCard}><Text style={styles.collectionGlyph}>◌</Text><Text style={styles.collectionValue}>{progress.discoveries.length}</Text><Text style={styles.collectionLabel}>DISCOVERIES</Text></View>
        </View>

        <Text style={styles.sectionTitle}>Recent discoveries</Text>
        {progress.discoveries.length ? progress.discoveries.slice(0, 6).map((item, index) => (
          <View key={item.id} style={styles.recent}>
            <View style={styles.recentIndex}><Text style={styles.recentIndexText}>{index + 1}</Text></View>
            <View style={{ flex: 1 }}><Text style={styles.recentText}>{item.title}</Text><Text style={styles.recentKind}>{item.kind.toUpperCase()}</Text></View>
          </View>
        )) : (
          <View style={styles.empty}><Text style={styles.emptyTitle}>Your collection is empty.</Text><Text style={styles.emptyBody}>Enter an Academy room, cast a spell or follow a Discover current. The app will remember it.</Text></View>
        )}

        <TouchableOpacity style={styles.primary} activeOpacity={0.86} onPress={() => router.push('/explore')}>
          <Text style={styles.primaryLabel}>KEEP MOVING</Text><Text style={styles.primaryTitle}>Find something new</Text><Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#06141E' }, content: { padding: 20, paddingBottom: 120 },
  kicker: { color: '#79E2F5', fontWeight: '900', letterSpacing: 2.2, fontSize: 10, marginTop: 10 }, title: { color: '#F3FBFE', fontSize: 36, lineHeight: 41, fontWeight: '900', marginTop: 7 }, body: { color: '#9DB3BE', fontSize: 14, lineHeight: 21, marginTop: 8 },
  identityCard: { marginTop: 23, borderRadius: 27, borderWidth: 1, borderColor: '#1D4B5B', backgroundColor: '#0A2532', padding: 19, flexDirection: 'row', alignItems: 'center', gap: 15 },
  levelCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#C7F6FF', alignItems: 'center', justifyContent: 'center' }, levelNumber: { color: '#06212C', fontSize: 28, fontWeight: '900' }, identityLabel: { color: '#78DDF1', fontSize: 8, fontWeight: '900', letterSpacing: 1.6 }, identityTitle: { color: '#F3FBFD', fontSize: 19, fontWeight: '900', marginTop: 4 }, identityHouse: { color: '#90AAB5', fontSize: 10, fontWeight: '800', marginTop: 3 }, progressTrack: { height: 7, borderRadius: 99, backgroundColor: '#153744', overflow: 'hidden', marginTop: 10 }, progressFill: { height: '100%', borderRadius: 99, backgroundColor: '#9DEBFB' }, levelCopy: { color: '#738F9A', fontSize: 9, marginTop: 6 },
  stats: { flexDirection: 'row', gap: 9, marginTop: 12 }, stat: { flex: 1, minHeight: 82, borderRadius: 21, borderWidth: 1, borderColor: '#173B49', backgroundColor: '#081D28', alignItems: 'center', justifyContent: 'center' }, statNumber: { color: '#F3FBFD', fontSize: 21, fontWeight: '900' }, statLabel: { color: '#70909C', fontSize: 8, fontWeight: '900', letterSpacing: 1.1, marginTop: 4 },
  sectionTitle: { color: '#F4FBFD', fontSize: 20, fontWeight: '900', marginTop: 28 }, sectionBody: { color: '#839EA9', fontSize: 11, lineHeight: 17, marginTop: 5 }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }, chip: { borderRadius: 999, borderWidth: 1, borderColor: '#1B4050', backgroundColor: '#081D28', paddingHorizontal: 14, paddingVertical: 10 }, chipActive: { backgroundColor: '#C7F6FF', borderColor: '#C7F6FF' }, chipText: { color: '#9DB3BE', fontSize: 10, fontWeight: '900' }, chipTextActive: { color: '#06212C' },
  collectionGrid: { marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 }, collectionCard: { width: '48%', minHeight: 123, borderRadius: 22, borderWidth: 1, borderColor: '#173B49', backgroundColor: '#081D28', padding: 15 }, collectionGlyph: { color: '#86E7F8', fontSize: 24 }, collectionValue: { color: '#F4FBFD', fontSize: 22, fontWeight: '900', marginTop: 12 }, collectionLabel: { color: '#6E8B96', fontSize: 8, fontWeight: '900', letterSpacing: 1, marginTop: 3 },
  recent: { minHeight: 66, marginTop: 9, borderRadius: 18, borderWidth: 1, borderColor: '#173B49', backgroundColor: '#081D28', paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }, recentIndex: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#0F3140', alignItems: 'center', justifyContent: 'center' }, recentIndexText: { color: '#7CE2F5', fontSize: 11, fontWeight: '900' }, recentText: { color: '#E9F7FA', fontSize: 12, fontWeight: '900' }, recentKind: { color: '#6D8B96', fontSize: 7, fontWeight: '900', letterSpacing: 1.1, marginTop: 3 },
  empty: { marginTop: 10, borderRadius: 20, borderWidth: 1, borderColor: '#173B49', backgroundColor: '#081D28', padding: 18 }, emptyTitle: { color: '#F3FBFD', fontSize: 15, fontWeight: '900' }, emptyBody: { color: '#839EA9', fontSize: 11, lineHeight: 17, marginTop: 5 },
  primary: { marginTop: 26, borderRadius: 24, backgroundColor: '#0A2633', borderWidth: 1, borderColor: '#1F5060', padding: 19, paddingRight: 50 }, primaryLabel: { color: '#78DDF1', fontSize: 8, fontWeight: '900', letterSpacing: 1.6 }, primaryTitle: { color: '#F3FBFD', fontSize: 18, fontWeight: '900', marginTop: 5 }, arrow: { position: 'absolute', right: 20, top: 23, color: '#82E7F9', fontSize: 34 },
});
