import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { academyPlaces, characters } from '../../lib/tidefall';
import { addDiscovery, discoverRoom, emptyProgress, loadProgress, recordSecret, saveProgress, type TidefallProgress } from '../../lib/progress';
import { dateKey, reconcileAchievements, secretForRoom, worldForDate } from '../../lib/world';

export default function AcademyPlaceScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const place = useMemo(() => academyPlaces.find((item) => item.slug === String(slug)), [slug]);
  const [progress, setProgress] = useState<TidefallProgress>(emptyProgress);
  const [newlyDiscovered, setNewlyDiscovered] = useState(false);
  const [loggedIntel, setLoggedIntel] = useState(false);
  const [foundSecret, setFoundSecret] = useState(false);
  const world = worldForDate();
  const roomSecret = place ? secretForRoom(place.slug) : undefined;
  const changedToday = place ? world.changedRoom === place.slug : false;
  const peopleHere = place
    ? Object.entries(world.characterLocations)
        .filter(([, location]) => location === place.title)
        .map(([characterSlug]) => characters.find((character) => character.slug === characterSlug)?.name)
        .filter((name): name is string => Boolean(name))
    : [];

  useEffect(() => {
    let alive = true;
    (async () => {
      const current = await loadProgress();
      if (!place || !alive) {
        if (alive) setProgress(current);
        return;
      }
      const wasKnown = current.discoveredRooms.includes(place.slug);
      let next = discoverRoom(current, place.slug, place.title);
      if (changedToday) {
        next = addDiscovery(
          next,
          { id: `daily:${dateKey()}:${place.slug}`, title: `${place.title} changed with today's Tide`, kind: 'lore' },
          25,
        );
      }
      next = reconcileAchievements(next);
      if (next !== current) await saveProgress(next);
      if (alive) {
        setProgress(next);
        setNewlyDiscovered(!wasKnown);
        setLoggedIntel(next.discoveries.some((item) => item.id === `intel:${place.slug}`));
        setFoundSecret(roomSecret ? next.foundSecrets.includes(roomSecret.slug) : false);
      }
    })();
    return () => { alive = false; };
  }, [place, changedToday, roomSecret]);

  async function investigate() {
    if (!place) return;
    let next = addDiscovery(progress, { id: `intel:${place.slug}`, title: `${place.title} intel logged`, kind: 'lore' }, 30);
    next = reconcileAchievements(next);
    if (next !== progress) await saveProgress(next);
    setProgress(next);
    setLoggedIntel(true);
  }

  async function searchForSecret() {
    if (!roomSecret || !loggedIntel || foundSecret) return;
    let next = recordSecret(progress, roomSecret.slug, roomSecret.title, roomSecret.points);
    next = reconcileAchievements(next);
    await saveProgress(next);
    setProgress(next);
    setFoundSecret(true);
  }

  if (!place) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.missing}>
          <Text style={styles.missingTitle}>That room moved.</Text>
          <Text style={styles.missingBody}>The Academy cannot find this route right now.</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.back()}><Text style={styles.primaryText}>GO BACK</Text></TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <LinearGradient colors={['#041019', changedToday ? '#0B3040' : '#082330', '#041019']} style={styles.bg}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" style={styles.back} onPress={() => router.back()}><Text style={styles.backText}>‹</Text></TouchableOpacity>

          <View style={[styles.heroGlyph, changedToday && styles.heroGlyphChanged]}><Text style={styles.heroGlyphText}>{place.glyph}</Text></View>
          <Text style={styles.kicker}>{place.floor.toUpperCase()} FLOOR · ACADEMY</Text>
          <Text style={styles.title}>{place.title}</Text>
          <Text style={styles.body}>{place.copy}</Text>

          {changedToday && (
            <View style={styles.changedBanner}>
              <Text style={styles.changedGlyph}>≈</Text>
              <View style={{ flex: 1 }}><Text style={styles.changedLabel}>CHANGED TODAY</Text><Text style={styles.changedTitle}>The Tide is affecting this room.</Text><Text style={styles.changedBody}>{world.body} First visit today logs a +25 Tide Point current.</Text></View>
            </View>
          )}

          {newlyDiscovered && (
            <View style={styles.discoveryBanner}>
              <Text style={styles.discoveryGlyph}>⌁</Text>
              <View style={{ flex: 1 }}><Text style={styles.discoveryLabel}>NEW DISCOVERY</Text><Text style={styles.discoveryTitle}>Room added to your Academy.</Text><Text style={styles.discoveryPoints}>+70 Tide Points</Text></View>
            </View>
          )}

          {peopleHere.length > 0 && (
            <View style={styles.peopleBanner}>
              <Text style={styles.peopleLabel}>HERE NOW</Text>
              <Text style={styles.peopleTitle}>{peopleHere.join(' · ')}</Text>
              <Text style={styles.peopleBody}>Character locations move with the daily Tide.</Text>
            </View>
          )}

          <View style={styles.statRow}>
            <View style={styles.stat}><Text style={styles.statValue}>{foundSecret ? '1' : '0'}/{roomSecret ? '1' : '0'}</Text><Text style={styles.statLabel}>SECRET FOUND</Text></View>
            <View style={styles.stat}><Text style={styles.statValue}>{place.floor}</Text><Text style={styles.statLabel}>LOCATION</Text></View>
            <View style={styles.stat}><Text style={styles.statValue}>{progress.discoveredRooms.length}</Text><Text style={styles.statLabel}>ROOMS FOUND</Text></View>
          </View>

          <Text style={styles.sectionTitle}>Known intel</Text>
          {place.intel.map((line, index) => (
            <View key={line} style={styles.intelRow}><View style={styles.intelIndex}><Text style={styles.intelIndexText}>{index + 1}</Text></View><Text style={styles.intelText}>{line}</Text></View>
          ))}

          <TouchableOpacity style={[styles.investigate, loggedIntel && styles.investigateDone]} activeOpacity={0.86} onPress={investigate} disabled={loggedIntel}>
            <Text style={styles.investigateLabel}>{loggedIntel ? 'INTEL LOGGED' : 'INVESTIGATE'}</Text>
            <Text style={styles.investigateTitle}>{loggedIntel ? 'You have looked closely enough to notice what is wrong.' : 'Inspect this room more closely'}</Text>
            <Text style={styles.investigateBody}>{loggedIntel ? 'That means the hidden thread is now searchable.' : 'Log this location and earn 30 Tide Points.'}</Text>
          </TouchableOpacity>

          {roomSecret && (
            <TouchableOpacity
              style={[styles.secretCard, loggedIntel && !foundSecret && styles.secretReady, foundSecret && styles.secretFound]}
              activeOpacity={0.86}
              onPress={searchForSecret}
              disabled={!loggedIntel || foundSecret}
            >
              <Text style={styles.secretGlyph}>{foundSecret ? '✓' : '?'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.secretLabel}>{foundSecret ? 'SECRET FOUND' : loggedIntel ? 'HIDDEN THREAD DETECTED' : 'SECRET LOCKED'}</Text>
                <Text style={styles.secretTitle}>{foundSecret ? roomSecret.title : loggedIntel ? 'Search the room' : 'Investigate first'}</Text>
                <Text style={styles.secretBody}>{foundSecret ? roomSecret.clue : loggedIntel ? `Something here does not fit. Find it for +${roomSecret.points} Tide Points.` : 'You need more context before this room will reveal anything.'}</Text>
              </View>
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 }, safe: { flex: 1 }, content: { padding: 20, paddingBottom: 120 }, back: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: '#214959', backgroundColor: '#081E29', alignItems: 'center', justifyContent: 'center' }, backText: { color: '#F5FCFF', fontSize: 34, lineHeight: 37, marginTop: -3 },
  heroGlyph: { width: 92, height: 92, borderRadius: 29, marginTop: 34, backgroundColor: '#0C2D3A', borderWidth: 1, borderColor: '#286075', alignItems: 'center', justifyContent: 'center' }, heroGlyphChanged: { borderColor: '#8DEAFF', backgroundColor: '#0D3948', shadowColor: '#70E2F5', shadowOpacity: 0.3, shadowRadius: 16 }, heroGlyphText: { color: '#A9F1FF', fontSize: 45, fontWeight: '300' },
  kicker: { color: '#7CE1F4', fontSize: 10, fontWeight: '900', letterSpacing: 2, marginTop: 24 }, title: { color: '#FFFFFF', fontSize: 42, lineHeight: 47, fontWeight: '900', marginTop: 7 }, body: { color: '#A7C0CA', fontSize: 15, lineHeight: 23, marginTop: 10 },
  changedBanner: { marginTop: 22, borderRadius: 23, borderWidth: 1, borderColor: '#65C7DC', backgroundColor: '#0B3140', padding: 17, flexDirection: 'row', gap: 13, alignItems: 'center' }, changedGlyph: { color: '#A3F0FD', fontSize: 34 }, changedLabel: { color: '#8BE8F8', fontSize: 8, fontWeight: '900', letterSpacing: 1.6 }, changedTitle: { color: '#F5FBFD', fontSize: 16, fontWeight: '900', marginTop: 4 }, changedBody: { color: '#96B4BE', fontSize: 10, lineHeight: 15, marginTop: 4 },
  discoveryBanner: { marginTop: 10, borderRadius: 23, borderWidth: 1, borderColor: '#2B6578', backgroundColor: '#0B2B38', padding: 17, flexDirection: 'row', alignItems: 'center', gap: 14 }, discoveryGlyph: { color: '#8CEAFF', fontSize: 31 }, discoveryLabel: { color: '#75DFF3', fontSize: 9, fontWeight: '900', letterSpacing: 1.7 }, discoveryTitle: { color: '#F4FBFD', fontSize: 16, fontWeight: '900', marginTop: 4 }, discoveryPoints: { color: '#9AE9F8', fontSize: 11, fontWeight: '800', marginTop: 5 },
  peopleBanner: { marginTop: 10, borderRadius: 21, borderWidth: 1, borderColor: '#1E4958', backgroundColor: '#09222D', padding: 15 }, peopleLabel: { color: '#6ED9EE', fontSize: 8, fontWeight: '900', letterSpacing: 1.5 }, peopleTitle: { color: '#F1FAFD', fontSize: 15, fontWeight: '900', marginTop: 4 }, peopleBody: { color: '#738F99', fontSize: 9, marginTop: 4 },
  statRow: { flexDirection: 'row', gap: 9, marginTop: 22 }, stat: { flex: 1, minHeight: 84, borderRadius: 20, borderWidth: 1, borderColor: '#193E4D', backgroundColor: '#081D28', alignItems: 'center', justifyContent: 'center', padding: 8 }, statValue: { color: '#F3FBFD', fontSize: 18, fontWeight: '900', textAlign: 'center' }, statLabel: { color: '#6F909C', fontSize: 7, fontWeight: '900', letterSpacing: 1.1, marginTop: 5, textAlign: 'center' },
  sectionTitle: { color: '#F5FBFD', fontSize: 22, fontWeight: '900', marginTop: 30, marginBottom: 8 }, intelRow: { minHeight: 64, borderRadius: 19, borderWidth: 1, borderColor: '#173A48', backgroundColor: '#081C27', padding: 14, marginTop: 9, flexDirection: 'row', alignItems: 'center', gap: 12 }, intelIndex: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#10313E', alignItems: 'center', justifyContent: 'center' }, intelIndexText: { color: '#77DFF2', fontSize: 11, fontWeight: '900' }, intelText: { flex: 1, color: '#C4D9E0', fontSize: 12, lineHeight: 18, fontWeight: '700' },
  investigate: { marginTop: 24, borderRadius: 25, borderWidth: 1, borderColor: '#2A667A', backgroundColor: '#0B2B38', padding: 20 }, investigateDone: { borderColor: '#1B4654', backgroundColor: '#09222D' }, investigateLabel: { color: '#79E2F5', fontSize: 9, fontWeight: '900', letterSpacing: 1.8 }, investigateTitle: { color: '#F5FBFD', fontSize: 19, fontWeight: '900', marginTop: 6 }, investigateBody: { color: '#8FAAB5', fontSize: 12, lineHeight: 18, marginTop: 6 },
  secretCard: { marginTop: 12, borderRadius: 24, borderWidth: 1, borderColor: '#193A48', borderStyle: 'dashed', backgroundColor: '#071923', padding: 18, flexDirection: 'row', gap: 14, alignItems: 'center' }, secretReady: { borderColor: '#5F9AA9', backgroundColor: '#09232D' }, secretFound: { borderStyle: 'solid', borderColor: '#367285', backgroundColor: '#0B2A36' }, secretGlyph: { width: 46, height: 46, borderRadius: 23, textAlign: 'center', textAlignVertical: 'center', color: '#82DFF0', fontSize: 22, fontWeight: '900', borderWidth: 1, borderColor: '#315461' }, secretLabel: { color: '#7195A1', fontSize: 9, fontWeight: '900', letterSpacing: 1.5 }, secretTitle: { color: '#E0EDF1', fontSize: 15, fontWeight: '900', marginTop: 4 }, secretBody: { color: '#78929C', fontSize: 11, lineHeight: 16, marginTop: 4 },
  missing: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: '#041019' }, missingTitle: { color: '#F4FBFD', fontSize: 28, fontWeight: '900' }, missingBody: { color: '#8FAAB5', fontSize: 14, marginTop: 8, textAlign: 'center' }, primaryButton: { marginTop: 20, backgroundColor: '#C7F6FF', borderRadius: 16, paddingHorizontal: 20, paddingVertical: 13 }, primaryText: { color: '#06212C', fontSize: 11, fontWeight: '900', letterSpacing: 1.2 },
});
