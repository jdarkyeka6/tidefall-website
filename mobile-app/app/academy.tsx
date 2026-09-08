import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ASSET, academyPlaces, characters } from '../lib/tidefall';
import { emptyProgress, loadProgress, type TidefallProgress } from '../lib/progress';
import { questCompletion, quests, worldForDate } from '../lib/world';

const mapRows = [
  ['dorms'],
  ['library', 'classrooms'],
  ['cafe', 'records'],
  ['hidden-corridors'],
] as const;

export default function AcademyScreen() {
  const [progress, setProgress] = useState<TidefallProgress>(emptyProgress);
  const world = worldForDate();
  const worldQuest = quests.find((quest) => quest.slug === world.quest);
  const questState = worldQuest ? questCompletion(progress, worldQuest) : null;

  useFocusEffect(useCallback(() => {
    let active = true;
    loadProgress().then((next) => { if (active) setProgress(next); });
    return () => { active = false; };
  }, []));

  const totalSecrets = academyPlaces.reduce((sum, place) => sum + place.secrets, 0);
  const currentCharacters = useMemo(() => Object.entries(world.characterLocations), [world]);

  function charactersAt(title: string) {
    return currentCharacters
      .filter(([, location]) => location === title)
      .map(([slug]) => characters.find((character) => character.slug === slug)?.name)
      .filter((name): name is string => Boolean(name));
  }

  return (
    <LinearGradient colors={['#041019', '#071E2A', '#041019']} style={styles.bg}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <ImageBackground source={{ uri: `${ASSET}/tidefall-mobile-hero.webp` }} style={styles.hero} imageStyle={styles.heroImage}>
            <LinearGradient colors={['rgba(3,13,19,0.08)', 'rgba(3,13,19,0.92)']} style={styles.shade}>
              <Text style={styles.kicker}>TIDEFALL ACADEMY</Text>
              <Text style={styles.title}>The map is alive.</Text>
              <Text style={styles.body}>Rooms remember you, people move around, and today's Tide can make one place behave differently.</Text>
            </LinearGradient>
          </ImageBackground>

          <View style={styles.overview}>
            <View style={styles.overviewMain}>
              <Text style={styles.overviewLabel}>YOUR MAP</Text>
              <Text style={styles.overviewTitle}>{progress.discoveredRooms.length} of {academyPlaces.length} areas found</Text>
              <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${Math.max(4, (progress.discoveredRooms.length / academyPlaces.length) * 100)}%` }]} /></View>
            </View>
            <TouchableOpacity style={styles.secretCount} onPress={() => router.push('/secrets')}>
              <Text style={styles.secretNumber}>{progress.foundSecrets.length}/{totalSecrets}</Text><Text style={styles.secretSmall}>SECRET THREADS</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tideCard}>
            <Text style={styles.tideGlyph}>≈</Text>
            <View style={{ flex: 1 }}><Text style={styles.tideLabel}>{world.label}</Text><Text style={styles.tideTitle}>{world.title}</Text><Text style={styles.tideBody}>{world.body}</Text></View>
          </View>

          {worldQuest && questState && !progress.completedQuests.includes(worldQuest.slug) && (
            <TouchableOpacity style={styles.questStrip} activeOpacity={0.86} onPress={() => router.push('/quests')}>
              <View style={{ flex: 1 }}><Text style={styles.questLabel}>QUEST CURRENT</Text><Text style={styles.questTitle}>{worldQuest.title}</Text><Text style={styles.questBody}>{questState.completed}/{questState.total} steps complete</Text></View><Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          )}

          <View style={styles.sectionRow}><Text style={styles.sectionTitle}>Academy map</Text><Text style={styles.sectionMeta}>Tap a node to enter</Text></View>

          <View style={styles.mapShell}>
            <Text style={styles.mapCompass}>N</Text>
            {mapRows.map((row, rowIndex) => (
              <View key={rowIndex}>
                <View style={styles.mapRow}>
                  {row.map((slug) => {
                    const place = academyPlaces.find((item) => item.slug === slug);
                    if (!place) return null;
                    const discovered = progress.discoveredRooms.includes(place.slug);
                    const changed = world.changedRoom === place.slug;
                    const present = charactersAt(place.title);
                    const masked = place.hidden && !discovered;
                    return (
                      <TouchableOpacity
                        key={place.slug}
                        activeOpacity={0.84}
                        style={[styles.node, changed && styles.nodeChanged, masked && styles.nodeHidden]}
                        onPress={() => router.push(`/academy/${place.slug}` as never)}
                      >
                        <View style={styles.nodeTop}><Text style={styles.nodeGlyph}>{place.glyph}</Text><View style={[styles.nodeDot, discovered && styles.nodeDotFound]} /></View>
                        <Text style={styles.nodeFloor}>{masked ? 'UNMAPPED' : place.floor.toUpperCase()}</Text>
                        <Text style={styles.nodeTitle}>{masked ? 'Unknown route' : place.title}</Text>
                        {changed && <Text style={styles.changedBadge}>CHANGED TODAY</Text>}
                        {present.length > 0 && <Text style={styles.present}>{present.join(' · ')} here</Text>}
                        <Text style={styles.nodeStatus}>{discovered ? 'DISCOVERED' : 'ENTER TO DISCOVER'}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {rowIndex < mapRows.length - 1 && <View style={styles.connector}><View style={styles.connectorLine} /><View style={styles.connectorDot} /><View style={styles.connectorLine} /></View>}
              </View>
            ))}
          </View>

          <View style={styles.peopleCard}>
            <Text style={styles.peopleLabel}>PEOPLE ARE MOVING</Text>
            <Text style={styles.peopleTitle}>The Academy is not a static directory anymore.</Text>
            <View style={styles.peopleList}>
              {characters.map((character) => (
                <TouchableOpacity key={character.slug} style={styles.personRow} onPress={() => router.push(`/characters/${character.slug}` as never)}>
                  <View style={[styles.personDot, { backgroundColor: character.tint }]} />
                  <Text style={styles.personName}>{character.name}</Text>
                  <Text style={styles.personLocation}>{world.characterLocations[character.slug] || 'Academy'}</Text>
                  <Text style={styles.personArrow}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 }, safe: { flex: 1 }, content: { paddingBottom: 120 }, hero: { height: 315, justifyContent: 'flex-end' }, heroImage: { resizeMode: 'cover' }, shade: { flex: 1, justifyContent: 'flex-end', padding: 22, paddingBottom: 27 },
  kicker: { color: '#8FEAFF', fontSize: 10, fontWeight: '900', letterSpacing: 2.5 }, title: { color: '#FFFFFF', fontSize: 37, lineHeight: 42, fontWeight: '900', marginTop: 8 }, body: { color: '#C6DCE5', fontSize: 14, lineHeight: 21, marginTop: 9 },
  overview: { marginHorizontal: 18, marginTop: 18, borderRadius: 25, padding: 18, backgroundColor: '#0A2532', borderWidth: 1, borderColor: '#1D4C5C', flexDirection: 'row', gap: 14, alignItems: 'center' }, overviewMain: { flex: 1 }, overviewLabel: { color: '#78DDF2', fontSize: 9, fontWeight: '900', letterSpacing: 1.7 }, overviewTitle: { color: '#F4FBFE', fontSize: 18, fontWeight: '900', marginTop: 5 }, progressTrack: { height: 7, borderRadius: 99, backgroundColor: '#143743', overflow: 'hidden', marginTop: 11 }, progressFill: { height: '100%', borderRadius: 99, backgroundColor: '#9DEBFB' },
  secretCount: { width: 88, minHeight: 78, borderRadius: 20, backgroundColor: '#071B25', borderWidth: 1, borderColor: '#173D4C', alignItems: 'center', justifyContent: 'center', padding: 8 }, secretNumber: { color: '#F3FBFD', fontSize: 19, fontWeight: '900' }, secretSmall: { color: '#708D98', fontSize: 7, textAlign: 'center', fontWeight: '900', letterSpacing: 0.8, marginTop: 3 },
  tideCard: { marginHorizontal: 18, marginTop: 11, borderRadius: 22, borderWidth: 1, borderColor: '#25596B', backgroundColor: '#0A2633', padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }, tideGlyph: { color: '#8BEAFF', fontSize: 32 }, tideLabel: { color: '#76DDF1', fontSize: 8, fontWeight: '900', letterSpacing: 1.5 }, tideTitle: { color: '#F4FBFD', fontSize: 16, fontWeight: '900', marginTop: 4 }, tideBody: { color: '#879FA9', fontSize: 10, lineHeight: 15, marginTop: 4 },
  questStrip: { marginHorizontal: 18, marginTop: 10, minHeight: 75, borderRadius: 20, borderWidth: 1, borderColor: '#1B4554', backgroundColor: '#081F2A', padding: 15, flexDirection: 'row', alignItems: 'center' }, questLabel: { color: '#6ED9EE', fontSize: 8, fontWeight: '900', letterSpacing: 1.4 }, questTitle: { color: '#EFF9FC', fontSize: 15, fontWeight: '900', marginTop: 3 }, questBody: { color: '#738D98', fontSize: 9, marginTop: 3 }, arrow: { color: '#80E5F7', fontSize: 27 },
  sectionRow: { marginHorizontal: 20, marginTop: 28, marginBottom: 13, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, sectionTitle: { color: '#F5FBFD', fontSize: 22, fontWeight: '900' }, sectionMeta: { color: '#688590', fontSize: 9, fontWeight: '800' },
  mapShell: { marginHorizontal: 18, borderRadius: 28, borderWidth: 1, borderColor: '#1A4251', backgroundColor: '#071B25', padding: 16, paddingTop: 26 }, mapCompass: { position: 'absolute', right: 18, top: 12, color: '#42606C', fontSize: 9, fontWeight: '900', letterSpacing: 2 }, mapRow: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
  node: { flex: 1, maxWidth: 174, minHeight: 148, borderRadius: 21, borderWidth: 1, borderColor: '#1C4757', backgroundColor: '#0A2430', padding: 13 }, nodeChanged: { borderColor: '#74DFF2', backgroundColor: '#0C2E3B', shadowColor: '#72E2F5', shadowOpacity: 0.22, shadowRadius: 12 }, nodeHidden: { borderStyle: 'dashed', backgroundColor: '#061820', borderColor: '#314650' },
  nodeTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, nodeGlyph: { color: '#A9F1FD', fontSize: 25 }, nodeDot: { width: 8, height: 8, borderRadius: 4, borderWidth: 1, borderColor: '#48616B' }, nodeDotFound: { backgroundColor: '#8CE9FA', borderColor: '#8CE9FA' }, nodeFloor: { color: '#6FD7EA', fontSize: 7, fontWeight: '900', letterSpacing: 1.2, marginTop: 10 }, nodeTitle: { color: '#F3FBFD', fontSize: 15, fontWeight: '900', marginTop: 3 }, changedBadge: { alignSelf: 'flex-start', marginTop: 7, borderRadius: 999, backgroundColor: '#C7F6FF', color: '#06212C', fontSize: 6, fontWeight: '900', letterSpacing: 0.9, paddingHorizontal: 7, paddingVertical: 4 }, present: { color: '#9ADDE9', fontSize: 8, fontWeight: '800', marginTop: 7 }, nodeStatus: { color: '#607E89', fontSize: 7, fontWeight: '900', letterSpacing: 0.8, marginTop: 9 },
  connector: { height: 30, alignItems: 'center', justifyContent: 'center' }, connectorLine: { width: 1, height: 10, backgroundColor: '#28505F' }, connectorDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#3A6879' },
  peopleCard: { marginHorizontal: 18, marginTop: 18, borderRadius: 24, borderWidth: 1, borderColor: '#193F4E', backgroundColor: '#081E29', padding: 18 }, peopleLabel: { color: '#71DCEF', fontSize: 8, fontWeight: '900', letterSpacing: 1.5 }, peopleTitle: { color: '#F4FBFD', fontSize: 18, lineHeight: 23, fontWeight: '900', marginTop: 5 }, peopleList: { marginTop: 12, gap: 8 }, personRow: { minHeight: 45, borderRadius: 15, backgroundColor: '#071923', borderWidth: 1, borderColor: '#153743', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 11, gap: 9 }, personDot: { width: 7, height: 7, borderRadius: 4 }, personName: { color: '#EAF6F9', fontSize: 11, fontWeight: '900' }, personLocation: { flex: 1, color: '#77939E', fontSize: 9, textAlign: 'right' }, personArrow: { color: '#76DFF2', fontSize: 20 },
});
