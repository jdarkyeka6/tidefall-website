import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { academyPlaces } from '../../lib/tidefall';
import { addDiscovery, discoverRoom, emptyProgress, loadProgress, saveProgress, type TidefallProgress } from '../../lib/progress';

export default function AcademyPlaceScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const place = useMemo(() => academyPlaces.find((item) => item.slug === String(slug)), [slug]);
  const [progress, setProgress] = useState<TidefallProgress>(emptyProgress);
  const [newlyDiscovered, setNewlyDiscovered] = useState(false);
  const [loggedIntel, setLoggedIntel] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const current = await loadProgress();
      if (!place || !alive) {
        if (alive) setProgress(current);
        return;
      }
      const wasKnown = current.discoveredRooms.includes(place.slug);
      const next = discoverRoom(current, place.slug, place.title);
      if (next !== current) await saveProgress(next);
      if (alive) {
        setProgress(next);
        setNewlyDiscovered(!wasKnown);
        setLoggedIntel(next.discoveries.some((item) => item.id === `intel:${place.slug}`));
      }
    })();
    return () => { alive = false; };
  }, [place]);

  async function investigate() {
    if (!place) return;
    const next = addDiscovery(
      progress,
      { id: `intel:${place.slug}`, title: `${place.title} intel logged`, kind: 'lore' },
      30,
    );
    if (next !== progress) await saveProgress(next);
    setProgress(next);
    setLoggedIntel(true);
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
    <LinearGradient colors={['#041019', '#082330', '#041019']} style={styles.bg}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" style={styles.back} onPress={() => router.back()}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>

          <View style={styles.heroGlyph}><Text style={styles.heroGlyphText}>{place.glyph}</Text></View>
          <Text style={styles.kicker}>{place.floor.toUpperCase()} FLOOR · ACADEMY</Text>
          <Text style={styles.title}>{place.title}</Text>
          <Text style={styles.body}>{place.copy}</Text>

          {newlyDiscovered && (
            <View style={styles.discoveryBanner}>
              <Text style={styles.discoveryGlyph}>≈</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.discoveryLabel}>NEW DISCOVERY</Text>
                <Text style={styles.discoveryTitle}>Room added to your Academy.</Text>
                <Text style={styles.discoveryPoints}>+70 Tide Points</Text>
              </View>
            </View>
          )}

          <View style={styles.statRow}>
            <View style={styles.stat}><Text style={styles.statValue}>{place.secrets}</Text><Text style={styles.statLabel}>SECRETS</Text></View>
            <View style={styles.stat}><Text style={styles.statValue}>{place.floor}</Text><Text style={styles.statLabel}>LOCATION</Text></View>
            <View style={styles.stat}><Text style={styles.statValue}>{progress.discoveredRooms.length}</Text><Text style={styles.statLabel}>ROOMS FOUND</Text></View>
          </View>

          <Text style={styles.sectionTitle}>Known intel</Text>
          {place.intel.map((line, index) => (
            <View key={line} style={styles.intelRow}>
              <View style={styles.intelIndex}><Text style={styles.intelIndexText}>{index + 1}</Text></View>
              <Text style={styles.intelText}>{line}</Text>
            </View>
          ))}

          <TouchableOpacity style={[styles.investigate, loggedIntel && styles.investigateDone]} activeOpacity={0.86} onPress={investigate}>
            <Text style={styles.investigateLabel}>{loggedIntel ? 'LOGGED' : 'INVESTIGATE'}</Text>
            <Text style={styles.investigateTitle}>{loggedIntel ? 'Room intel saved to your discoveries.' : 'Inspect this room more closely'}</Text>
            <Text style={styles.investigateBody}>{loggedIntel ? 'Come back later. Tidefall can change what a place reveals.' : 'Log this location and earn 30 Tide Points.'}</Text>
          </TouchableOpacity>

          <View style={styles.secretCard}>
            <Text style={styles.secretGlyph}>?</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.secretLabel}>SECRETS</Text>
              <Text style={styles.secretTitle}>{place.secrets} hidden thread{place.secrets === 1 ? '' : 's'} remain here.</Text>
              <Text style={styles.secretBody}>The room exists now. That does not mean it has told you everything.</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 }, safe: { flex: 1 }, content: { padding: 20, paddingBottom: 120 },
  back: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: '#214959', backgroundColor: '#081E29', alignItems: 'center', justifyContent: 'center' },
  backText: { color: '#F5FCFF', fontSize: 34, lineHeight: 37, marginTop: -3 },
  heroGlyph: { width: 92, height: 92, borderRadius: 29, marginTop: 34, backgroundColor: '#0C2D3A', borderWidth: 1, borderColor: '#286075', alignItems: 'center', justifyContent: 'center' },
  heroGlyphText: { color: '#A9F1FF', fontSize: 45, fontWeight: '300' },
  kicker: { color: '#7CE1F4', fontSize: 10, fontWeight: '900', letterSpacing: 2, marginTop: 24 },
  title: { color: '#FFFFFF', fontSize: 42, lineHeight: 47, fontWeight: '900', marginTop: 7 },
  body: { color: '#A7C0CA', fontSize: 15, lineHeight: 23, marginTop: 10 },
  discoveryBanner: { marginTop: 24, borderRadius: 23, borderWidth: 1, borderColor: '#2B6578', backgroundColor: '#0B2B38', padding: 17, flexDirection: 'row', alignItems: 'center', gap: 14 },
  discoveryGlyph: { color: '#8CEAFF', fontSize: 35 }, discoveryLabel: { color: '#75DFF3', fontSize: 9, fontWeight: '900', letterSpacing: 1.7 }, discoveryTitle: { color: '#F4FBFD', fontSize: 16, fontWeight: '900', marginTop: 4 }, discoveryPoints: { color: '#9AE9F8', fontSize: 11, fontWeight: '800', marginTop: 5 },
  statRow: { flexDirection: 'row', gap: 9, marginTop: 24 }, stat: { flex: 1, minHeight: 84, borderRadius: 20, borderWidth: 1, borderColor: '#193E4D', backgroundColor: '#081D28', alignItems: 'center', justifyContent: 'center', padding: 8 }, statValue: { color: '#F3FBFD', fontSize: 18, fontWeight: '900', textAlign: 'center' }, statLabel: { color: '#6F909C', fontSize: 7, fontWeight: '900', letterSpacing: 1.1, marginTop: 5, textAlign: 'center' },
  sectionTitle: { color: '#F5FBFD', fontSize: 22, fontWeight: '900', marginTop: 30, marginBottom: 8 },
  intelRow: { minHeight: 64, borderRadius: 19, borderWidth: 1, borderColor: '#173A48', backgroundColor: '#081C27', padding: 14, marginTop: 9, flexDirection: 'row', alignItems: 'center', gap: 12 },
  intelIndex: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#10313E', alignItems: 'center', justifyContent: 'center' }, intelIndexText: { color: '#77DFF2', fontSize: 11, fontWeight: '900' }, intelText: { flex: 1, color: '#C4D9E0', fontSize: 12, lineHeight: 18, fontWeight: '700' },
  investigate: { marginTop: 24, borderRadius: 25, borderWidth: 1, borderColor: '#2A667A', backgroundColor: '#0B2B38', padding: 20 }, investigateDone: { borderColor: '#1B4654', backgroundColor: '#09222D' }, investigateLabel: { color: '#79E2F5', fontSize: 9, fontWeight: '900', letterSpacing: 1.8 }, investigateTitle: { color: '#F5FBFD', fontSize: 19, fontWeight: '900', marginTop: 6 }, investigateBody: { color: '#8FAAB5', fontSize: 12, lineHeight: 18, marginTop: 6 },
  secretCard: { marginTop: 12, borderRadius: 24, borderWidth: 1, borderColor: '#193A48', borderStyle: 'dashed', backgroundColor: '#071923', padding: 18, flexDirection: 'row', gap: 14, alignItems: 'center' }, secretGlyph: { width: 46, height: 46, borderRadius: 23, textAlign: 'center', textAlignVertical: 'center', color: '#68818B', fontSize: 22, fontWeight: '900', borderWidth: 1, borderColor: '#28414C' }, secretLabel: { color: '#708B96', fontSize: 9, fontWeight: '900', letterSpacing: 1.5 }, secretTitle: { color: '#D6E6EB', fontSize: 15, fontWeight: '900', marginTop: 4 }, secretBody: { color: '#708993', fontSize: 11, lineHeight: 16, marginTop: 4 },
  missing: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: '#041019' }, missingTitle: { color: '#F4FBFD', fontSize: 28, fontWeight: '900' }, missingBody: { color: '#8FAAB5', fontSize: 14, marginTop: 8, textAlign: 'center' }, primaryButton: { marginTop: 20, backgroundColor: '#C7F6FF', borderRadius: 16, paddingHorizontal: 20, paddingVertical: 13 }, primaryText: { color: '#06212C', fontSize: 11, fontWeight: '900', letterSpacing: 1.2 },
});
