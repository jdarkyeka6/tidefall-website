import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ASSET, academyPlaces } from '../lib/tidefall';
import { emptyProgress, loadProgress, type TidefallProgress } from '../lib/progress';

const floors = ['All', 'Ground', 'Upper', 'Unknown'] as const;

export default function AcademyScreen() {
  const [floor, setFloor] = useState<(typeof floors)[number]>('All');
  const [progress, setProgress] = useState<TidefallProgress>(emptyProgress);

  useFocusEffect(useCallback(() => {
    let active = true;
    loadProgress().then((next) => { if (active) setProgress(next); });
    return () => { active = false; };
  }, []));

  const visible = useMemo(() => academyPlaces.filter((place) => floor === 'All' || place.floor === floor), [floor]);
  const totalSecrets = academyPlaces.reduce((sum, place) => sum + place.secrets, 0);

  return (
    <LinearGradient colors={['#041019', '#071E2A', '#041019']} style={styles.bg}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <ImageBackground source={{ uri: `${ASSET}/tidefall-mobile-hero.webp` }} style={styles.hero} imageStyle={styles.heroImage}>
            <LinearGradient colors={['rgba(3,13,19,0.08)', 'rgba(3,13,19,0.92)']} style={styles.shade}>
              <Text style={styles.kicker}>TIDEFALL ACADEMY</Text>
              <Text style={styles.title}>Explore the Academy.</Text>
              <Text style={styles.body}>Every room you enter becomes part of your Tidefall. Some routes are considerably less cooperative than others.</Text>
            </LinearGradient>
          </ImageBackground>

          <View style={styles.overview}>
            <View style={styles.overviewMain}>
              <Text style={styles.overviewLabel}>YOUR MAP</Text>
              <Text style={styles.overviewTitle}>{progress.discoveredRooms.length} of {academyPlaces.length} areas found</Text>
              <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${Math.max(4, (progress.discoveredRooms.length / academyPlaces.length) * 100)}%` }]} /></View>
            </View>
            <View style={styles.secretCount}><Text style={styles.secretNumber}>{totalSecrets}</Text><Text style={styles.secretSmall}>HIDDEN THREADS</Text></View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
            {floors.map((item) => (
              <TouchableOpacity key={item} style={[styles.filter, floor === item && styles.filterActive]} onPress={() => setFloor(item)}>
                <Text style={[styles.filterText, floor === item && styles.filterTextActive]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>{floor === 'All' ? 'Academy map' : `${floor} floor`}</Text>
            <Text style={styles.sectionMeta}>Tap a room to enter</Text>
          </View>

          <View style={styles.grid}>
            {visible.map((place) => {
              const discovered = progress.discoveredRooms.includes(place.slug);
              return (
                <TouchableOpacity
                  key={place.slug}
                  accessibilityRole="button"
                  accessibilityLabel={`Enter ${place.title}`}
                  style={[styles.card, place.hidden && !discovered && styles.hiddenCard]}
                  activeOpacity={0.84}
                  onPress={() => router.push(`/academy/${place.slug}` as never)}
                >
                  <View style={styles.cardTop}>
                    <View style={styles.iconBubble}><Text style={styles.icon}>{place.glyph}</Text></View>
                    <View style={[styles.statusDot, discovered && styles.statusDotFound]} />
                  </View>
                  <Text style={styles.floorLabel}>{place.hidden && !discovered ? 'UNMAPPED' : place.floor.toUpperCase()}</Text>
                  <Text style={styles.cardTitle}>{place.hidden && !discovered ? 'Unknown route' : place.title}</Text>
                  <Text style={styles.cardCopy}>{place.hidden && !discovered ? 'The map is admitting that something is here. It is not being more helpful than that.' : place.copy}</Text>
                  <View style={styles.cardFooter}>
                    <Text style={styles.cardStatus}>{discovered ? 'DISCOVERED' : 'ENTER TO DISCOVER'}</Text>
                    <Text style={styles.arrow}>›</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity style={styles.currentCard} activeOpacity={0.86} onPress={() => router.push('/explore')}>
            <Text style={styles.currentGlyph}>≈</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.currentLabel}>FOLLOW ANOTHER CURRENT</Text>
              <Text style={styles.currentTitle}>Let Discover choose what to investigate next.</Text>
            </View>
            <Text style={styles.currentArrow}>›</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 }, safe: { flex: 1 }, content: { paddingBottom: 120 },
  hero: { height: 330, justifyContent: 'flex-end' }, heroImage: { resizeMode: 'cover' }, shade: { flex: 1, justifyContent: 'flex-end', padding: 22, paddingBottom: 27 },
  kicker: { color: '#8FEAFF', fontSize: 10, fontWeight: '900', letterSpacing: 2.5 }, title: { color: '#FFFFFF', fontSize: 37, lineHeight: 42, fontWeight: '900', marginTop: 8 }, body: { color: '#C6DCE5', fontSize: 14, lineHeight: 21, marginTop: 9 },
  overview: { marginHorizontal: 18, marginTop: 18, borderRadius: 25, padding: 18, backgroundColor: '#0A2532', borderWidth: 1, borderColor: '#1D4C5C', flexDirection: 'row', gap: 14, alignItems: 'center' }, overviewMain: { flex: 1 }, overviewLabel: { color: '#78DDF2', fontSize: 9, fontWeight: '900', letterSpacing: 1.7 }, overviewTitle: { color: '#F4FBFE', fontSize: 18, fontWeight: '900', marginTop: 5 }, progressTrack: { height: 7, borderRadius: 99, backgroundColor: '#143743', overflow: 'hidden', marginTop: 11 }, progressFill: { height: '100%', borderRadius: 99, backgroundColor: '#9DEBFB' },
  secretCount: { width: 82, minHeight: 78, borderRadius: 20, backgroundColor: '#071B25', borderWidth: 1, borderColor: '#173D4C', alignItems: 'center', justifyContent: 'center', padding: 8 }, secretNumber: { color: '#F3FBFD', fontSize: 22, fontWeight: '900' }, secretSmall: { color: '#708D98', fontSize: 7, textAlign: 'center', fontWeight: '900', letterSpacing: 0.9, marginTop: 3 },
  filters: { gap: 8, paddingHorizontal: 18, paddingVertical: 14 }, filter: { borderRadius: 999, borderWidth: 1, borderColor: '#1A3F4E', backgroundColor: '#081D28', paddingHorizontal: 14, paddingVertical: 9 }, filterActive: { backgroundColor: '#C7F6FF', borderColor: '#C7F6FF' }, filterText: { color: '#91AAB5', fontSize: 10, fontWeight: '900' }, filterTextActive: { color: '#06212C' },
  sectionRow: { marginHorizontal: 20, marginTop: 8, marginBottom: 13, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, sectionTitle: { color: '#F5FBFD', fontSize: 22, fontWeight: '900' }, sectionMeta: { color: '#688590', fontSize: 9, fontWeight: '800' },
  grid: { paddingHorizontal: 18, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  card: { width: '48%', minHeight: 224, backgroundColor: '#09212C', borderRadius: 24, borderWidth: 1, borderColor: '#1A4353', padding: 16 }, hiddenCard: { borderStyle: 'dashed', backgroundColor: '#071A24' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, iconBubble: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#10313E', alignItems: 'center', justifyContent: 'center' }, icon: { color: '#B8F2FC', fontSize: 23 }, statusDot: { width: 9, height: 9, borderRadius: 99, borderWidth: 1, borderColor: '#49626C' }, statusDotFound: { backgroundColor: '#8CE9FA', borderColor: '#8CE9FA' },
  floorLabel: { color: '#6ED9EE', fontSize: 8, fontWeight: '900', letterSpacing: 1.3, marginTop: 15 }, cardTitle: { color: '#F4FBFD', fontSize: 16, fontWeight: '900', marginTop: 4 }, cardCopy: { color: '#879FA9', fontSize: 11, lineHeight: 16, marginTop: 6, flex: 1 }, cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }, cardStatus: { color: '#718E99', fontSize: 7, fontWeight: '900', letterSpacing: 1 }, arrow: { color: '#80E5F7', fontSize: 25 },
  currentCard: { marginHorizontal: 18, marginTop: 24, borderRadius: 24, borderWidth: 1, borderColor: '#1D4C5C', backgroundColor: '#0A2532', padding: 18, flexDirection: 'row', alignItems: 'center', gap: 13 }, currentGlyph: { color: '#8BEAFF', fontSize: 34 }, currentLabel: { color: '#75DDF1', fontSize: 8, fontWeight: '900', letterSpacing: 1.4 }, currentTitle: { color: '#F2FAFD', fontSize: 15, fontWeight: '900', marginTop: 4 }, currentArrow: { color: '#80E5F7', fontSize: 28 },
});
