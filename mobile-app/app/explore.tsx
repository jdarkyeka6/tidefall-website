import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SITE = 'https://tidefall.com.au';
const VISITED_KEY = 'tidefall.visitedActivities';

type Activity = { title: string; subtitle: string; category: 'Quiz' | 'Game' | 'Lore' | 'Academy' | 'Characters'; url?: string; route?: string; icon: string };

const activities: Activity[] = [
  { title: 'Which character are you?', subtitle: 'Find your closest match across the core four.', category: 'Quiz', url: `${SITE}/character-quiz`, icon: '◌' },
  { title: 'Would you survive Tidefall?', subtitle: 'Make decisions through a full Academy day.', category: 'Quiz', url: `${SITE}/survive`, icon: '⚡' },
  { title: 'House quiz', subtitle: 'See where the Choosing Tide might place you.', category: 'Quiz', url: `${SITE}/house-quiz`, icon: '≈' },
  { title: 'Mini Adventure', subtitle: 'Choose a path below the waterline.', category: 'Game', url: `${SITE}/mini-adventure`, icon: '↯' },
  { title: 'Dolphin Dash', subtitle: 'A fast Tidefall challenge.', category: 'Game', url: `${SITE}/dolphin-dash`, icon: '🌊' },
  { title: 'Spell Trial', subtitle: 'Test your spell knowledge and control.', category: 'Game', url: `${SITE}/spell-trial`, icon: '✦' },
  { title: 'Secrets & discoveries', subtitle: 'Open the stranger side of Tidefall.', category: 'Lore', url: `${SITE}/secrets`, icon: '🗝️' },
  { title: 'Public lore', subtitle: 'Canon reference material from the universe.', category: 'Lore', url: `${SITE}/lore`, icon: '▤' },
  { title: 'Academy map', subtitle: 'Explore known rooms and locations.', category: 'Academy', url: `${SITE}/academy-map`, icon: '⌁' },
  { title: 'Academy guide', subtitle: 'Orders, rooms, classes and everyday Academy life.', category: 'Academy', url: `${SITE}/academy-guide`, icon: '🏰' },
  { title: 'The core four', subtitle: 'Native profiles for Harper, Jasper, Lily and Ava.', category: 'Characters', route: '/characters', icon: '◌◌' },
  { title: 'Relationship map', subtitle: 'See how the wider cast connects.', category: 'Characters', url: `${SITE}/relationships`, icon: '↔' },
];

const filters = ['All', 'Quiz', 'Game', 'Lore', 'Academy', 'Characters'] as const;

export default function ExploreScreen() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<(typeof filters)[number]>('All');
  const visible = useMemo(() => activities.filter((item) => {
    const matchesFilter = filter === 'All' || item.category === filter;
    const haystack = `${item.title} ${item.subtitle} ${item.category}`.toLowerCase();
    return matchesFilter && haystack.includes(query.trim().toLowerCase());
  }), [query, filter]);

  async function openActivity(item: Activity) {
    try {
      const raw = await AsyncStorage.getItem(VISITED_KEY);
      const previous: string[] = raw ? JSON.parse(raw) : [];
      const next = [item.title, ...previous.filter((x) => x !== item.title)].slice(0, 30);
      await AsyncStorage.setItem(VISITED_KEY, JSON.stringify(next));
    } catch {}
    if (item.route) router.push(item.route as never);
    else if (item.url) Linking.openURL(item.url);
  }

  function randomActivity() {
    const pool = visible.length ? visible : activities;
    openActivity(pool[Math.floor(Math.random() * pool.length)]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>EXPLORE</Text>
        <Text style={styles.title}>Pick a current.</Text>
        <Text style={styles.body}>Search Tidefall activities, filter by type, or let the Tide choose something for you.</Text>

        <View style={styles.searchWrap}><Text style={styles.searchIcon}>⌕</Text><TextInput value={query} onChangeText={setQuery} placeholder="Search Tidefall" placeholderTextColor="#6F8995" style={styles.search} autoCorrect={false} /></View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {filters.map((item) => <TouchableOpacity key={item} onPress={() => setFilter(item)} style={[styles.filter, filter === item && styles.filterActive]}><Text style={[styles.filterText, filter === item && styles.filterTextActive]}>{item}</Text></TouchableOpacity>)}
        </ScrollView>

        <TouchableOpacity style={styles.random} activeOpacity={0.86} onPress={randomActivity}>
          <Text style={styles.randomGlyph}>≈</Text><View style={{ flex: 1 }}><Text style={styles.randomLabel}>LET THE TIDE CHOOSE</Text><Text style={styles.randomTitle}>Open a random activity</Text></View><Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <View style={styles.countRow}><Text style={styles.sectionTitle}>{filter === 'All' ? 'Everything' : filter}</Text><Text style={styles.count}>{visible.length} shown</Text></View>

        {visible.map((item) => (
          <TouchableOpacity key={item.title} accessibilityRole="button" accessibilityLabel={`Open ${item.title}`} style={styles.card} activeOpacity={0.84} onPress={() => openActivity(item)}>
            <View style={styles.iconBubble}><Text style={styles.icon}>{item.icon}</Text></View>
            <View style={styles.cardCopy}><Text style={styles.category}>{item.category.toUpperCase()}</Text><Text style={styles.cardText}>{item.title}</Text><Text style={styles.cardSub}>{item.subtitle}</Text></View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}

        {!visible.length && <View style={styles.empty}><Text style={styles.emptyTitle}>Nothing in this current.</Text><Text style={styles.emptyBody}>Try another search or category.</Text></View>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#06141E' }, content: { padding: 20, paddingBottom: 120 },
  kicker: { color: '#79E2F5', fontWeight: '900', letterSpacing: 2.2, fontSize: 11, marginTop: 12 },
  title: { color: '#F3FBFE', fontSize: 34, lineHeight: 39, fontWeight: '900', marginTop: 8 },
  body: { color: '#9DB3BE', fontSize: 15, lineHeight: 22, marginTop: 10 },
  searchWrap: { marginTop: 22, height: 54, borderRadius: 18, borderWidth: 1, borderColor: '#1B4050', backgroundColor: '#0A202B', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15 },
  searchIcon: { color: '#79DDF1', fontSize: 23, marginRight: 10 }, search: { flex: 1, color: '#F1FAFD', fontSize: 15 },
  filters: { gap: 8, paddingVertical: 14 }, filter: { borderRadius: 999, borderWidth: 1, borderColor: '#1B4050', backgroundColor: '#081D28', paddingHorizontal: 14, paddingVertical: 9 },
  filterActive: { backgroundColor: '#C7F6FF', borderColor: '#C7F6FF' }, filterText: { color: '#9BB4BF', fontSize: 11, fontWeight: '800' }, filterTextActive: { color: '#06212C' },
  random: { borderRadius: 23, borderWidth: 1, borderColor: '#1F5060', backgroundColor: '#0A2633', padding: 17, flexDirection: 'row', alignItems: 'center', gap: 12 },
  randomGlyph: { color: '#8BEAFF', fontSize: 31 }, randomLabel: { color: '#78DDF1', fontSize: 9, fontWeight: '900', letterSpacing: 1.6 }, randomTitle: { color: '#F3FBFD', fontSize: 16, fontWeight: '900', marginTop: 3 },
  countRow: { marginTop: 26, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, sectionTitle: { color: '#F5FBFD', fontSize: 21, fontWeight: '900' }, count: { color: '#708B96', fontSize: 11, fontWeight: '800' },
  card: { minHeight: 100, padding: 14, marginBottom: 11, borderRadius: 22, borderWidth: 1, borderColor: '#1B4050', backgroundColor: '#0A202B', flexDirection: 'row', alignItems: 'center', gap: 13 },
  iconBubble: { width: 50, height: 50, borderRadius: 17, backgroundColor: '#102F3C', alignItems: 'center', justifyContent: 'center' }, icon: { color: '#BCEFF8', fontSize: 22 },
  cardCopy: { flex: 1 }, category: { color: '#6ED9EE', fontSize: 8, fontWeight: '900', letterSpacing: 1.4 }, cardText: { color: '#EEF9FC', fontSize: 15, fontWeight: '900', marginTop: 3 }, cardSub: { color: '#839EA9', fontSize: 11, lineHeight: 16, marginTop: 4 },
  arrow: { color: '#83E8FA', fontSize: 29, fontWeight: '300' }, empty: { borderRadius: 22, borderWidth: 1, borderColor: '#1B4050', backgroundColor: '#0A202B', padding: 22, alignItems: 'center' }, emptyTitle: { color: '#F3FBFE', fontSize: 17, fontWeight: '900' }, emptyBody: { color: '#8FA7B2', fontSize: 12, marginTop: 6 },
});
