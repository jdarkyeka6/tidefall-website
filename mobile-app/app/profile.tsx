import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PROFILE_KEY = 'tidefall.profile';
const VISITED_KEY = 'tidefall.visitedActivities';
const orders = ['Brannor', 'Riptide', 'Proving'];
const favourites = ['Harper', 'Jasper', 'Lily', 'Ava'];

type SavedProfile = { order?: string; favourite?: string };

export default function ProfileScreen() {
  const [profile, setProfile] = useState<SavedProfile>({});
  const [visited, setVisited] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [savedProfile, savedVisited] = await Promise.all([AsyncStorage.getItem(PROFILE_KEY), AsyncStorage.getItem(VISITED_KEY)]);
        if (savedProfile) setProfile(JSON.parse(savedProfile));
        if (savedVisited) setVisited(JSON.parse(savedVisited));
      } catch {}
    })();
  }, []);

  async function updateProfile(next: SavedProfile) {
    const merged = { ...profile, ...next };
    setProfile(merged);
    try { await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(merged)); } catch {}
  }

  const discoveries = Math.min(visited.length, 30);
  const level = Math.max(1, Math.floor(discoveries / 3) + 1);
  const xp = discoveries * 35;
  const nextLevelXp = level * 105;
  const levelProgress = Math.min(1, (xp - (level - 1) * 105) / 105);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>YOUR TIDEFALL</Text>
        <Text style={styles.title}>Your journey lives here.</Text>
        <Text style={styles.body}>Choose who you connect with, track what you have explored and build your place in Tidefall.</Text>

        <View style={styles.levelCard}>
          <View style={styles.levelCircle}><Text style={styles.levelNumber}>{level}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.levelLabel}>ACADEMY LEVEL</Text>
            <Text style={styles.levelTitle}>{xp} Tide Points</Text>
            <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${Math.max(5, levelProgress * 100)}%` }]} /></View>
            <Text style={styles.levelNext}>{Math.max(0, nextLevelXp - xp)} points to next level</Text>
          </View>
        </View>

        <View style={styles.stats}>
          <View style={styles.stat}><Text style={styles.statNumber}>{discoveries}</Text><Text style={styles.statLabel}>DISCOVERIES</Text></View>
          <View style={styles.stat}><Text style={styles.statNumber}>{profile.order ? '1' : '0'}</Text><Text style={styles.statLabel}>ORDER</Text></View>
          <View style={styles.stat}><Text style={styles.statNumber}>{profile.favourite ? '1' : '0'}</Text><Text style={styles.statLabel}>FAVOURITE</Text></View>
        </View>

        <Text style={styles.sectionTitle}>Your Order</Text>
        <Text style={styles.sectionBody}>Choose the Order you want on your profile. You can change it whenever you want.</Text>
        <View style={styles.chips}>{orders.map((order) => <TouchableOpacity key={order} onPress={() => updateProfile({ order })} style={[styles.chip, profile.order === order && styles.chipActive]}><Text style={[styles.chipText, profile.order === order && styles.chipTextActive]}>{order}</Text></TouchableOpacity>)}</View>

        <Text style={styles.sectionTitle}>Favourite character</Text>
        <View style={styles.chips}>{favourites.map((favourite) => <TouchableOpacity key={favourite} onPress={() => updateProfile({ favourite })} style={[styles.chip, profile.favourite === favourite && styles.chipActive]}><Text style={[styles.chipText, profile.favourite === favourite && styles.chipTextActive]}>{favourite}</Text></TouchableOpacity>)}</View>

        <Text style={styles.sectionTitle}>Recent discoveries</Text>
        {visited.length ? visited.slice(0, 5).map((item, index) => (
          <View key={item} style={styles.recent}><View style={styles.recentIndex}><Text style={styles.recentIndexText}>{index + 1}</Text></View><Text style={styles.recentText}>{item}</Text></View>
        )) : <View style={styles.empty}><Text style={styles.emptyTitle}>Nothing logged yet.</Text><Text style={styles.emptyBody}>Open Explore and try something. Your discoveries will start appearing here.</Text></View>}

        <TouchableOpacity style={styles.primary} activeOpacity={0.86} onPress={() => router.push('/explore')}><Text style={styles.primaryLabel}>FIND SOMETHING NEW</Text><Text style={styles.primaryTitle}>Explore Tidefall</Text><Text style={styles.arrow}>›</Text></TouchableOpacity>
        <TouchableOpacity style={styles.secondary} activeOpacity={0.86} onPress={() => router.push('/characters')}><Text style={styles.secondaryText}>Meet the core four</Text><Text style={styles.secondaryArrow}>›</Text></TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#06141E' }, content: { padding: 20, paddingBottom: 120 },
  kicker: { color: '#79E2F5', fontWeight: '900', letterSpacing: 2.2, fontSize: 11, marginTop: 12 },
  title: { color: '#F3FBFE', fontSize: 34, lineHeight: 40, fontWeight: '900', marginTop: 8 },
  body: { color: '#9DB3BE', fontSize: 14, lineHeight: 21, marginTop: 9 },
  levelCard: { marginTop: 24, borderRadius: 26, borderWidth: 1, borderColor: '#1D4B5B', backgroundColor: '#0A2532', padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16 },
  levelCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#C7F6FF', alignItems: 'center', justifyContent: 'center' }, levelNumber: { color: '#06212C', fontSize: 28, fontWeight: '900' },
  levelLabel: { color: '#78DDF1', fontSize: 9, fontWeight: '900', letterSpacing: 1.7 }, levelTitle: { color: '#F3FBFD', fontSize: 20, fontWeight: '900', marginTop: 5 },
  progressTrack: { height: 7, borderRadius: 99, backgroundColor: '#153744', overflow: 'hidden', marginTop: 10 }, progressFill: { height: '100%', borderRadius: 99, backgroundColor: '#9DEBFB' }, levelNext: { color: '#7F9AA5', fontSize: 10, marginTop: 6 },
  stats: { flexDirection: 'row', gap: 10, marginTop: 12 }, stat: { flex: 1, minHeight: 88, borderRadius: 21, borderWidth: 1, borderColor: '#173B49', backgroundColor: '#081D28', alignItems: 'center', justifyContent: 'center' }, statNumber: { color: '#F3FBFD', fontSize: 22, fontWeight: '900' }, statLabel: { color: '#70909C', fontSize: 8, fontWeight: '900', letterSpacing: 1.2, marginTop: 4 },
  sectionTitle: { color: '#F4FBFD', fontSize: 20, fontWeight: '900', marginTop: 28 }, sectionBody: { color: '#839EA9', fontSize: 12, lineHeight: 18, marginTop: 5 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }, chip: { borderRadius: 999, borderWidth: 1, borderColor: '#1B4050', backgroundColor: '#081D28', paddingHorizontal: 14, paddingVertical: 10 }, chipActive: { backgroundColor: '#C7F6FF', borderColor: '#C7F6FF' }, chipText: { color: '#9DB3BE', fontSize: 11, fontWeight: '800' }, chipTextActive: { color: '#06212C' },
  recent: { minHeight: 62, marginTop: 9, borderRadius: 18, borderWidth: 1, borderColor: '#173B49', backgroundColor: '#081D28', paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }, recentIndex: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#0F3140', alignItems: 'center', justifyContent: 'center' }, recentIndexText: { color: '#7CE2F5', fontSize: 11, fontWeight: '900' }, recentText: { color: '#E9F7FA', fontSize: 13, fontWeight: '800', flex: 1 },
  empty: { marginTop: 10, borderRadius: 20, borderWidth: 1, borderColor: '#173B49', backgroundColor: '#081D28', padding: 18 }, emptyTitle: { color: '#F3FBFD', fontSize: 15, fontWeight: '900' }, emptyBody: { color: '#839EA9', fontSize: 11, lineHeight: 17, marginTop: 5 },
  primary: { marginTop: 26, borderRadius: 24, backgroundColor: '#0A2633', borderWidth: 1, borderColor: '#1F5060', padding: 19, paddingRight: 50 }, primaryLabel: { color: '#78DDF1', fontSize: 9, fontWeight: '900', letterSpacing: 1.6 }, primaryTitle: { color: '#F3FBFD', fontSize: 18, fontWeight: '900', marginTop: 5 }, arrow: { position: 'absolute', right: 20, top: 23, color: '#82E7F9', fontSize: 34 },
  secondary: { marginTop: 10, minHeight: 58, borderRadius: 19, backgroundColor: '#081D28', borderWidth: 1, borderColor: '#173B49', paddingHorizontal: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, secondaryText: { color: '#DDEFF4', fontSize: 13, fontWeight: '800' }, secondaryArrow: { color: '#78DDF1', fontSize: 28 },
});
