import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Image, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ASSET, characters, tideForDate } from '../lib/tidefall';
import { emptyProgress, levelFromPoints, loadProgress, titleFromProgress, type TidefallProgress } from '../lib/progress';

const cards = [
  { title: 'Academy', subtitle: 'Find rooms and log intel', icon: '⌁', route: '/academy' },
  { title: 'Magic', subtitle: 'Cast and master spells', icon: '✦', route: '/magic' },
  { title: 'Discover', subtitle: 'Follow a new current', icon: '◌', route: '/explore' },
  { title: 'Books', subtitle: 'Continue the story', icon: '▤', route: '/books' },
];

export default function HomeScreen() {
  const [progress, setProgress] = useState<TidefallProgress>(emptyProgress);
  const tide = tideForDate();

  useFocusEffect(useCallback(() => {
    let active = true;
    loadProgress().then((next) => { if (active) setProgress(next); });
    return () => { active = false; };
  }, []));

  const level = levelFromPoints(progress.tidePoints);
  const masteredSpells = Object.values(progress.spellMastery).filter((value) => value > 0).length;
  const identity = progress.profile.house ? `${progress.profile.house} · ${titleFromProgress(progress)}` : titleFromProgress(progress);

  return (
    <LinearGradient colors={['#041019', '#071A25', '#041019']} style={styles.background}>
      <SafeAreaView edges={['top']} style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <ImageBackground source={{ uri: `${ASSET}/hero.png` }} style={styles.hero} imageStyle={styles.heroImage}>
            <LinearGradient colors={['rgba(3,12,18,0.08)', 'rgba(3,12,18,0.28)', '#041019']} style={styles.heroShade}>
              <View style={styles.heroTop}>
                <Text style={styles.eyebrow}>YOUR TIDEFALL</Text>
                <Text style={styles.title}>TIDEFALL</Text>
                <Text style={styles.tagline}>{identity}</Text>
              </View>
              <View style={styles.levelPill}>
                <Text style={styles.levelNumber}>LV {level}</Text>
                <View><Text style={styles.levelLabel}>ACADEMY LEVEL</Text><Text style={styles.levelPoints}>{progress.tidePoints} Tide Points</Text></View>
              </View>
            </LinearGradient>
          </ImageBackground>

          <TouchableOpacity accessibilityRole="button" accessibilityLabel={tide.title} style={styles.tideCard} activeOpacity={0.86} onPress={() => router.push(tide.route as never)}>
            <Text style={styles.tideGlyph}>≈</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.tideLabel}>{tide.label}</Text>
              <Text style={styles.tideTitle}>{tide.title}</Text>
              <Text style={styles.tideBody}>{tide.body}</Text>
              <Text style={styles.tideAction}>{tide.action} ›</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.stats}>
            <TouchableOpacity style={styles.stat} onPress={() => router.push('/academy')}>
              <Text style={styles.statNumber}>{progress.discoveredRooms.length}</Text><Text style={styles.statLabel}>ROOMS</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.stat} onPress={() => router.push('/magic')}>
              <Text style={styles.statNumber}>{masteredSpells}</Text><Text style={styles.statLabel}>SPELLS</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.stat} onPress={() => router.push('/profile')}>
              <Text style={styles.statNumber}>{progress.discoveries.length}</Text><Text style={styles.statLabel}>DISCOVERIES</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitleInline}>Continue</Text>
            <Text style={styles.sectionMeta}>Saved on this device</Text>
          </View>
          <TouchableOpacity style={styles.continueCard} activeOpacity={0.86} onPress={() => router.push('/books')}>
            <View style={styles.continueIcon}><Text style={styles.continueIconText}>▤</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.continueLabel}>BOOK ONE</Text>
              <Text style={styles.continueTitle}>{progress.reading.bookOnePercent ? 'Continue the story' : 'Start the native preview'}</Text>
              <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${Math.max(4, progress.reading.bookOnePercent)}%` }]} /></View>
              <Text style={styles.progressCopy}>{progress.reading.bookOnePercent}% story progress</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Enter the world</Text>
          <View style={styles.grid}>
            {cards.map((card) => (
              <TouchableOpacity key={card.title} accessibilityRole="button" accessibilityLabel={card.title} style={styles.card} activeOpacity={0.82} onPress={() => router.push(card.route as never)}>
                <View style={styles.iconBubble}><Text style={styles.cardIcon}>{card.icon}</Text></View>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitleInline}>The core four</Text>
            <TouchableOpacity onPress={() => router.push('/characters')}><Text style={styles.sectionAction}>See all</Text></TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.characterRow}>
            {characters.map((character) => (
              <TouchableOpacity key={character.slug} accessibilityRole="button" accessibilityLabel={`Open ${character.name}'s character profile`} style={styles.characterCard} activeOpacity={0.85} onPress={() => router.push(`/characters/${character.slug}` as never)}>
                <Image source={{ uri: character.image }} style={styles.characterImage} />
                <LinearGradient colors={['transparent', 'rgba(3,13,19,0.97)']} style={styles.characterShade} />
                <View style={styles.characterNameWrap}>
                  <View style={[styles.characterDot, { backgroundColor: character.tint }]} />
                  <View><Text style={styles.characterName}>{character.name}</Text><Text style={styles.characterHouse}>{character.house}</Text></View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 }, safe: { flex: 1 }, content: { paddingBottom: 120 },
  hero: { height: 390, justifyContent: 'flex-end' }, heroImage: { resizeMode: 'cover' }, heroShade: { flex: 1, justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 24, paddingBottom: 30 }, heroTop: { marginTop: 5 },
  eyebrow: { color: '#9BEFFF', fontSize: 10, letterSpacing: 3.6, fontWeight: '900' }, title: { color: '#FFFFFF', fontSize: 48, letterSpacing: 4, fontWeight: '900', marginTop: 4, textShadowColor: 'rgba(0,0,0,0.42)', textShadowRadius: 12 }, tagline: { color: '#D8EEF5', fontSize: 13, fontWeight: '800', marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 },
  levelPill: { alignSelf: 'flex-start', minHeight: 58, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(185,239,250,0.28)', backgroundColor: 'rgba(4,16,25,0.78)', paddingHorizontal: 15, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 12 }, levelNumber: { color: '#06212C', backgroundColor: '#C7F6FF', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 8, fontSize: 11, fontWeight: '900' }, levelLabel: { color: '#75DDF1', fontSize: 8, fontWeight: '900', letterSpacing: 1.3 }, levelPoints: { color: '#F0FAFD', fontSize: 12, fontWeight: '900', marginTop: 3 },
  tideCard: { marginHorizontal: 18, marginTop: -4, padding: 19, backgroundColor: '#0A2633', borderRadius: 25, borderWidth: 1, borderColor: '#24586A', flexDirection: 'row', gap: 14 }, tideGlyph: { color: '#8BEAFF', fontSize: 37, fontWeight: '300' }, tideLabel: { color: '#79DDF1', fontSize: 9, fontWeight: '900', letterSpacing: 1.8 }, tideTitle: { color: '#F5FBFD', fontSize: 18, lineHeight: 23, fontWeight: '900', marginTop: 4 }, tideBody: { color: '#91AAB5', fontSize: 12, lineHeight: 18, marginTop: 5 }, tideAction: { color: '#8BE7F8', fontSize: 10, fontWeight: '900', letterSpacing: 1.2, marginTop: 10 },
  stats: { flexDirection: 'row', gap: 9, paddingHorizontal: 18, marginTop: 12 }, stat: { flex: 1, minHeight: 82, borderRadius: 21, borderWidth: 1, borderColor: '#173B49', backgroundColor: '#081D28', alignItems: 'center', justifyContent: 'center' }, statNumber: { color: '#F5FBFD', fontSize: 23, fontWeight: '900' }, statLabel: { color: '#71909B', fontSize: 8, fontWeight: '900', letterSpacing: 1.1, marginTop: 3 },
  sectionRow: { marginTop: 28, marginHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, sectionTitleInline: { color: '#F5FBFD', fontSize: 22, fontWeight: '900' }, sectionMeta: { color: '#67838E', fontSize: 9, fontWeight: '800' }, sectionAction: { color: '#80E2F4', fontSize: 12, fontWeight: '900', paddingVertical: 7, paddingLeft: 14 },
  continueCard: { marginHorizontal: 18, marginTop: 12, borderRadius: 24, borderWidth: 1, borderColor: '#1D4757', backgroundColor: '#09222D', padding: 16, flexDirection: 'row', alignItems: 'center', gap: 13 }, continueIcon: { width: 52, height: 64, borderRadius: 15, backgroundColor: '#123442', alignItems: 'center', justifyContent: 'center' }, continueIconText: { color: '#A9F0FE', fontSize: 26 }, continueLabel: { color: '#72DCEF', fontSize: 8, fontWeight: '900', letterSpacing: 1.3 }, continueTitle: { color: '#F1FAFD', fontSize: 15, fontWeight: '900', marginTop: 4 }, progressTrack: { height: 6, borderRadius: 99, backgroundColor: '#143540', overflow: 'hidden', marginTop: 9 }, progressFill: { height: '100%', borderRadius: 99, backgroundColor: '#9DEBFB' }, progressCopy: { color: '#708C97', fontSize: 9, marginTop: 5 }, chevron: { color: '#86E9FC', fontSize: 29 },
  sectionTitle: { color: '#F5FBFD', fontSize: 22, fontWeight: '900', marginTop: 28, marginHorizontal: 20, marginBottom: 14 },
  grid: { paddingHorizontal: 18, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 }, card: { width: '48%', minHeight: 155, backgroundColor: '#0A202B', borderRadius: 24, borderWidth: 1, borderColor: '#193D4C', padding: 17 }, iconBubble: { width: 46, height: 46, borderRadius: 16, backgroundColor: '#102F3C', alignItems: 'center', justifyContent: 'center' }, cardIcon: { color: '#C7F4FC', fontSize: 24 }, cardTitle: { color: '#F5FBFD', fontSize: 16, fontWeight: '900', marginTop: 15 }, cardSubtitle: { color: '#8FAAB5', fontSize: 12, lineHeight: 17, marginTop: 5 },
  characterRow: { paddingHorizontal: 20, gap: 12, paddingBottom: 6 }, characterCard: { width: 145, height: 205, borderRadius: 24, overflow: 'hidden', backgroundColor: '#0B202B', borderWidth: 1, borderColor: '#193E4D' }, characterImage: { width: '100%', height: '100%', resizeMode: 'cover' }, characterShade: { ...StyleSheet.absoluteFillObject }, characterNameWrap: { position: 'absolute', left: 14, right: 14, bottom: 13, flexDirection: 'row', alignItems: 'center', gap: 8 }, characterDot: { width: 7, height: 7, borderRadius: 99 }, characterName: { color: '#FFFFFF', fontWeight: '900', fontSize: 16 }, characterHouse: { color: '#7C98A3', fontWeight: '800', fontSize: 8, letterSpacing: 1.2, marginTop: 2 },
});
