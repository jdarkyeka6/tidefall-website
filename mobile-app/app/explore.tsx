import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { addDiscovery, emptyProgress, loadProgress, saveProgress, type DiscoveryKind, type TidefallProgress } from '../lib/progress';

type Category = 'Academy' | 'Magic' | 'Characters' | 'Story' | 'Lore';
type Activity = {
  id: string;
  title: string;
  subtitle: string;
  category: Category;
  icon: string;
  route?: string;
  discoveryTitle?: string;
  discoveryKind?: DiscoveryKind;
};

const activities: Activity[] = [
  { id: 'academy-map', title: 'Explore the Academy', subtitle: 'Enter native rooms, build your map and log room intel.', category: 'Academy', route: '/academy', icon: '⌁' },
  { id: 'hidden-corridors', title: 'Find the unmapped route', subtitle: 'The Academy map is admitting that something exists where it should not.', category: 'Academy', route: '/academy/hidden-corridors', icon: '≈' },
  { id: 'casting-chamber', title: 'Train a spell', subtitle: 'Charge the native casting chamber and increase spell mastery.', category: 'Magic', route: '/magic', icon: '✦' },
  { id: 'core-four', title: 'The core four', subtitle: 'Harper, Jasper, Lily and Ava in their native character hub.', category: 'Characters', route: '/characters', icon: '◌' },
  { id: 'book-one', title: 'Book One', subtitle: 'Open the native shelf and continue the story without leaving Tidefall.', category: 'Story', route: '/books', icon: '▤' },
  { id: 'titan-sense', title: 'Titan-sense', subtitle: 'A rare ability connected to what can be sensed beneath Tidefall.', category: 'Lore', icon: '◎', discoveryTitle: 'Titan-sense lore logged', discoveryKind: 'lore' },
  { id: 'wandless-magic', title: 'Wandless magic', subtitle: 'Tidefall magic is cast without wands. Technique, control and response matter.', category: 'Lore', icon: '◇', discoveryTitle: 'Wandless magic lore logged', discoveryKind: 'lore' },
  { id: 'choosing-tide', title: 'The Choosing Tide', subtitle: 'Your House becomes part of your Tidefall identity.', category: 'Lore', route: '/profile', icon: '≈' },
];

const filters = ['All', 'Academy', 'Magic', 'Characters', 'Story', 'Lore'] as const;

export default function ExploreScreen() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<(typeof filters)[number]>('All');
  const [progress, setProgress] = useState<TidefallProgress>(emptyProgress);
  const [message, setMessage] = useState('');

  useFocusEffect(useCallback(() => {
    let active = true;
    loadProgress().then((next) => { if (active) setProgress(next); });
    return () => { active = false; };
  }, []));

  const visible = useMemo(() => activities.filter((item) => {
    const matchesFilter = filter === 'All' || item.category === filter;
    const haystack = `${item.title} ${item.subtitle} ${item.category}`.toLowerCase();
    return matchesFilter && haystack.includes(query.trim().toLowerCase());
  }), [query, filter]);

  async function openActivity(item: Activity) {
    if (item.route) {
      router.push(item.route as never);
      return;
    }
    if (!item.discoveryTitle || !item.discoveryKind) return;
    const next = addDiscovery(progress, { id: `discover:${item.id}`, title: item.discoveryTitle, kind: item.discoveryKind }, 30);
    if (next !== progress) {
      await saveProgress(next);
      setProgress(next);
      setMessage(`${item.title} added to your discoveries. +30 Tide Points`);
    } else {
      setMessage(`${item.title} is already in your discoveries.`);
    }
  }

  function randomActivity() {
    const pool = visible.length ? visible : activities;
    openActivity(pool[Math.floor(Math.random() * pool.length)]);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>DISCOVER</Text>
        <Text style={styles.title}>Follow a current.</Text>
        <Text style={styles.body}>Everything here now stays inside Tidefall. Explore a room, train magic, read, meet characters or log a piece of lore.</Text>

        <View style={styles.topStats}>
          <View><Text style={styles.topNumber}>{progress.discoveries.length}</Text><Text style={styles.topLabel}>DISCOVERIES</Text></View>
          <View style={styles.topDivider} />
          <View><Text style={styles.topNumber}>{progress.tidePoints}</Text><Text style={styles.topLabel}>TIDE POINTS</Text></View>
        </View>

        <View style={styles.searchWrap}><Text style={styles.searchIcon}>⌕</Text><TextInput value={query} onChangeText={setQuery} placeholder="Search Tidefall" placeholderTextColor="#6F8995" style={styles.search} autoCorrect={false} /></View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {filters.map((item) => <TouchableOpacity key={item} onPress={() => setFilter(item)} style={[styles.filterChip, filter === item && styles.filterActive]}><Text style={[styles.filterText, filter === item && styles.filterTextActive]}>{item}</Text></TouchableOpacity>)}
        </ScrollView>

        <TouchableOpacity style={styles.random} activeOpacity={0.86} onPress={randomActivity}>
          <Text style={styles.randomGlyph}>≈</Text>
          <View style={{ flex: 1 }}><Text style={styles.randomLabel}>LET THE TIDE CHOOSE</Text><Text style={styles.randomTitle}>Open a random current</Text></View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        {!!message && <View style={styles.toast}><Text style={styles.toastText}>{message}</Text></View>}

        <View style={styles.countRow}><Text style={styles.sectionTitle}>{filter === 'All' ? 'For you' : filter}</Text><Text style={styles.count}>{visible.length} currents</Text></View>

        {visible.map((item) => {
          const logged = progress.discoveries.some((entry) => entry.id === `discover:${item.id}`);
          return (
            <TouchableOpacity key={item.id} accessibilityRole="button" accessibilityLabel={`Open ${item.title}`} style={styles.card} activeOpacity={0.84} onPress={() => openActivity(item)}>
              <View style={styles.iconBubble}><Text style={styles.icon}>{item.icon}</Text></View>
              <View style={styles.cardCopy}>
                <View style={styles.cardMetaRow}><Text style={styles.category}>{item.category.toUpperCase()}</Text>{logged && <Text style={styles.logged}>LOGGED</Text>}</View>
                <Text style={styles.cardText}>{item.title}</Text>
                <Text style={styles.cardSub}>{item.subtitle}</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          );
        })}

        {!visible.length && <View style={styles.empty}><Text style={styles.emptyTitle}>Nothing in this current.</Text><Text style={styles.emptyBody}>Try another search or category.</Text></View>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#06141E' }, content: { padding: 20, paddingBottom: 120 },
  kicker: { color: '#79E2F5', fontWeight: '900', letterSpacing: 2.2, fontSize: 10, marginTop: 10 }, title: { color: '#F3FBFE', fontSize: 36, lineHeight: 41, fontWeight: '900', marginTop: 7 }, body: { color: '#9DB3BE', fontSize: 14, lineHeight: 21, marginTop: 9 },
  topStats: { marginTop: 19, borderRadius: 22, borderWidth: 1, borderColor: '#1B4453', backgroundColor: '#09222D', padding: 16, flexDirection: 'row', alignItems: 'center', gap: 18 }, topNumber: { color: '#F4FBFD', fontSize: 21, fontWeight: '900' }, topLabel: { color: '#708F9A', fontSize: 8, fontWeight: '900', letterSpacing: 1.1, marginTop: 3 }, topDivider: { width: 1, height: 36, backgroundColor: '#1C4554' },
  searchWrap: { marginTop: 14, height: 54, borderRadius: 18, borderWidth: 1, borderColor: '#1B4050', backgroundColor: '#0A202B', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15 }, searchIcon: { color: '#79DDF1', fontSize: 23, marginRight: 10 }, search: { flex: 1, color: '#F1FAFD', fontSize: 15 },
  filters: { gap: 8, paddingVertical: 14 }, filterChip: { borderRadius: 999, borderWidth: 1, borderColor: '#1B4050', backgroundColor: '#081D28', paddingHorizontal: 14, paddingVertical: 9 }, filterActive: { backgroundColor: '#C7F6FF', borderColor: '#C7F6FF' }, filterText: { color: '#9BB4BF', fontSize: 10, fontWeight: '900' }, filterTextActive: { color: '#06212C' },
  random: { borderRadius: 23, borderWidth: 1, borderColor: '#1F5060', backgroundColor: '#0A2633', padding: 17, flexDirection: 'row', alignItems: 'center', gap: 12 }, randomGlyph: { color: '#8BEAFF', fontSize: 31 }, randomLabel: { color: '#78DDF1', fontSize: 8, fontWeight: '900', letterSpacing: 1.6 }, randomTitle: { color: '#F3FBFD', fontSize: 16, fontWeight: '900', marginTop: 3 },
  toast: { marginTop: 10, borderRadius: 17, borderWidth: 1, borderColor: '#2C6171', backgroundColor: '#0C2C38', padding: 12 }, toastText: { color: '#BDEFFA', fontSize: 11, lineHeight: 16, fontWeight: '800' },
  countRow: { marginTop: 25, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, sectionTitle: { color: '#F5FBFD', fontSize: 21, fontWeight: '900' }, count: { color: '#708B96', fontSize: 10, fontWeight: '800' },
  card: { minHeight: 104, padding: 14, marginBottom: 11, borderRadius: 22, borderWidth: 1, borderColor: '#1B4050', backgroundColor: '#0A202B', flexDirection: 'row', alignItems: 'center', gap: 13 }, iconBubble: { width: 52, height: 52, borderRadius: 17, backgroundColor: '#102F3C', alignItems: 'center', justifyContent: 'center' }, icon: { color: '#BCEFF8', fontSize: 23 }, cardCopy: { flex: 1 }, cardMetaRow: { flexDirection: 'row', justifyContent: 'space-between' }, category: { color: '#6ED9EE', fontSize: 8, fontWeight: '900', letterSpacing: 1.3 }, logged: { color: '#87D4A0', fontSize: 7, fontWeight: '900', letterSpacing: 1 }, cardText: { color: '#EEF9FC', fontSize: 15, fontWeight: '900', marginTop: 3 }, cardSub: { color: '#839EA9', fontSize: 11, lineHeight: 16, marginTop: 4 }, arrow: { color: '#83E8FA', fontSize: 29, fontWeight: '300' },
  empty: { borderRadius: 22, borderWidth: 1, borderColor: '#1B4050', backgroundColor: '#0A202B', padding: 22, alignItems: 'center' }, emptyTitle: { color: '#F3FBFE', fontSize: 17, fontWeight: '900' }, emptyBody: { color: '#8FA7B2', fontSize: 12, marginTop: 6 },
});
