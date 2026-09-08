import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Image, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ASSET, characters } from '../lib/tidefall';
import { emptyProgress, levelFromPoints, loadProgress, recordSecret, saveProgress, titleFromProgress, type TidefallProgress } from '../lib/progress';
import { questCompletion, quests, reconcileAchievements, secrets, worldForDate } from '../lib/world';

const cards = [
  { title: 'Academy', subtitle: 'Explore the living map', icon: '⌁', route: '/academy' },
  { title: 'Magic', subtitle: 'Cast, score and master spells', icon: '✦', route: '/magic' },
  { title: 'Quests', subtitle: 'Follow multi-step currents', icon: '☷', route: '/quests' },
  { title: 'Secrets', subtitle: 'Things the Academy hid', icon: '?', route: '/secrets' },
  { title: 'Discover', subtitle: 'Follow a new current', icon: '◌', route: '/explore' },
  { title: 'Books', subtitle: 'Read and change the world', icon: '▤', route: '/books' },
];

export default function HomeScreen() {
  const [progress, setProgress] = useState<TidefallProgress>(emptyProgress);
  const [tideTaps, setTideTaps] = useState(0);
  const [secretFlash, setSecretFlash] = useState(false);
  const world = worldForDate();
  const worldQuest = quests.find((quest) => quest.slug === world.quest);

  useFocusEffect(useCallback(() => {
    let active = true;
    loadProgress().then(async (loaded) => {
      const next = reconcileAchievements(loaded);
      if (next !== loaded) await saveProgress(next);
      if (active) setProgress(next);
    });
    return () => { active = false; };
  }, []));

  async function tapTide() {
    const nextCount = tideTaps + 1;
    setTideTaps(nextCount);
    if (nextCount < 6) return;
    setTideTaps(0);
    const secret = secrets.find((item) => item.slug === 'sixth-tide');
    if (!secret || progress.foundSecrets.includes(secret.slug)) return;
    const next = reconcileAchievements(recordSecret(progress, secret.slug, secret.title, secret.points));
    await saveProgress(next);
    setProgress(next);
    setSecretFlash(true);
  }

  const level = levelFromPoints(progress.tidePoints);
  const masteredSpells = Object.values(progress.spellMastery).filter((value) => value > 0).length;
  const identity = progress.profile.house ? `${progress.profile.house} · ${titleFromProgress(progress)}` : titleFromProgress(progress);
  const questState = worldQuest ? questCompletion(progress, worldQuest) : null;

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

          {secretFlash && (
            <TouchableOpacity style={styles.secretFlash} activeOpacity={0.86} onPress={() => { setSecretFlash(false); router.push('/secrets'); }}>
              <Text style={styles.secretFlashGlyph}>?</Text>
              <View style={{ flex: 1 }}><Text style={styles.secretFlashLabel}>SECRET FOUND</Text><Text style={styles.secretFlashTitle}>The Sixth Tide</Text><Text style={styles.secretFlashBody}>Most people stop tapping earlier.</Text></View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          )}

          <View style={styles.tideCard}>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Tide symbol" style={styles.tideTap} activeOpacity={0.75} onPress={tapTide}>
              <Text style={styles.tideGlyph}>≈</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ flex: 1 }} activeOpacity={0.84} onPress={() => router.push(world.changedRoom ? `/academy/${world.changedRoom}` as never : world.boostedSpell ? '/magic' : world.quest ? '/quests' : '/explore')}>
              <Text style={styles.tideLabel}>{world.label}</Text>
              <Text style={styles.tideTitle}>{world.title}</Text>
              <Text style={styles.tideBody}>{world.body}</Text>
              <Text style={styles.tideAction}>FOLLOW TODAY'S CURRENT ›</Text>
            </TouchableOpacity>
          </View>

          {worldQuest && questState && !progress.completedQuests.includes(worldQuest.slug) && (
            <TouchableOpacity style={styles.questCard} activeOpacity={0.86} onPress={() => router.push('/quests')}>
              <View style={styles.questTop}><Text style={styles.questLabel}>ACTIVE CURRENT · {worldQuest.label}</Text><Text style={styles.questCount}>{questState.completed}/{questState.total}</Text></View>
              <Text style={styles.questTitle}>{worldQuest.title}</Text>
              <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${(questState.completed / questState.total) * 100}%` }]} /></View>
              <Text style={styles.questBody}>{questState.ready ? `Ready to claim +${worldQuest.reward} Tide Points.` : 'Your progress updates automatically across the app.'}</Text>
            </TouchableOpacity>
          )}

          <View style={styles.stats}>
            <TouchableOpacity style={styles.stat} onPress={() => router.push('/academy')}><Text style={styles.statNumber}>{progress.discoveredRooms.length}</Text><Text style={styles.statLabel}>ROOMS</Text></TouchableOpacity>
            <TouchableOpacity style={styles.stat} onPress={() => router.push('/magic')}><Text style={styles.statNumber}>{progress.totalCasts}</Text><Text style={styles.statLabel}>CASTS</Text></TouchableOpacity>
            <TouchableOpacity style={styles.stat} onPress={() => router.push('/secrets')}><Text style={styles.statNumber}>{progress.foundSecrets.length}</Text><Text style={styles.statLabel}>SECRETS</Text></TouchableOpacity>
            <TouchableOpacity style={styles.stat} onPress={() => router.push('/quests')}><Text style={styles.statNumber}>{progress.completedQuests.length}</Text><Text style={styles.statLabel}>QUESTS</Text></TouchableOpacity>
          </View>

          <View style={styles.sectionRow}><Text style={styles.sectionTitleInline}>Continue</Text><Text style={styles.sectionMeta}>The story changes your save</Text></View>
          <TouchableOpacity style={styles.continueCard} activeOpacity={0.86} onPress={() => router.push('/books')}>
            <View style={styles.continueIcon}><Text style={styles.continueIconText}>▤</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.continueLabel}>BOOK ONE</Text>
              <Text style={styles.continueTitle}>{progress.reading.bookOnePercent ? 'Continue the story' : 'Start reading in Tidefall'}</Text>
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
                <Text style={styles.cardTitle}>{card.title}</Text><Text style={styles.cardSubtitle}>{card.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.sectionRow}><Text style={styles.sectionTitleInline}>In the Academy now</Text><TouchableOpacity onPress={() => router.push('/characters')}><Text style={styles.sectionAction}>See all</Text></TouchableOpacity></View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.characterRow}>
            {characters.map((character) => (
              <TouchableOpacity key={character.slug} style={styles.characterCard} activeOpacity={0.85} onPress={() => router.push(`/characters/${character.slug}` as never)}>
                <Image source={{ uri: character.image }} style={styles.characterImage} />
                <LinearGradient colors={['transparent', 'rgba(3,13,19,0.97)']} style={styles.characterShade} />
                <View style={styles.characterNameWrap}><View style={[styles.characterDot, { backgroundColor: character.tint }]} /><View><Text style={styles.characterName}>{character.name}</Text><Text style={styles.characterHouse}>{world.characterLocations[character.slug] || character.house}</Text></View></View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 }, safe: { flex: 1 }, content: { paddingBottom: 120 }, hero: { height: 390, justifyContent: 'flex-end' }, heroImage: { resizeMode: 'cover' }, heroShade: { flex: 1, justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 24, paddingBottom: 30 }, heroTop: { marginTop: 5 },
  eyebrow: { color: '#9BEFFF', fontSize: 10, letterSpacing: 3.6, fontWeight: '900' }, title: { color: '#FFFFFF', fontSize: 48, letterSpacing: 4, fontWeight: '900', marginTop: 4, textShadowColor: 'rgba(0,0,0,0.42)', textShadowRadius: 12 }, tagline: { color: '#D8EEF5', fontSize: 13, fontWeight: '800', marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 },
  levelPill: { alignSelf: 'flex-start', minHeight: 58, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(185,239,250,0.28)', backgroundColor: 'rgba(4,16,25,0.78)', paddingHorizontal: 15, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 12 }, levelNumber: { color: '#06212C', backgroundColor: '#C7F6FF', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 8, fontSize: 11, fontWeight: '900' }, levelLabel: { color: '#75DDF1', fontSize: 8, fontWeight: '900', letterSpacing: 1.3 }, levelPoints: { color: '#F0FAFD', fontSize: 12, fontWeight: '900', marginTop: 3 },
  secretFlash: { marginHorizontal: 18, marginTop: -3, borderRadius: 22, borderWidth: 1, borderStyle: 'dashed', borderColor: '#54717B', backgroundColor: '#091A22', padding: 15, flexDirection: 'row', gap: 12, alignItems: 'center' }, secretFlashGlyph: { color: '#9AB0B7', fontSize: 30, fontWeight: '900' }, secretFlashLabel: { color: '#77929C', fontSize: 8, fontWeight: '900', letterSpacing: 1.5 }, secretFlashTitle: { color: '#EAF4F7', fontSize: 16, fontWeight: '900', marginTop: 3 }, secretFlashBody: { color: '#7A919A', fontSize: 10, marginTop: 3 },
  tideCard: { marginHorizontal: 18, marginTop: 10, padding: 18, backgroundColor: '#0A2633', borderRadius: 25, borderWidth: 1, borderColor: '#24586A', flexDirection: 'row', gap: 12 }, tideTap: { width: 48, height: 56, alignItems: 'center', justifyContent: 'center' }, tideGlyph: { color: '#8BEAFF', fontSize: 38, fontWeight: '300' }, tideLabel: { color: '#79DDF1', fontSize: 9, fontWeight: '900', letterSpacing: 1.8 }, tideTitle: { color: '#F5FBFD', fontSize: 18, lineHeight: 23, fontWeight: '900', marginTop: 4 }, tideBody: { color: '#91AAB5', fontSize: 12, lineHeight: 18, marginTop: 5 }, tideAction: { color: '#8BE7F8', fontSize: 9, fontWeight: '900', letterSpacing: 1.1, marginTop: 10 },
  questCard: { marginHorizontal: 18, marginTop: 11, borderRadius: 22, borderWidth: 1, borderColor: '#214B5B', backgroundColor: '#09232E', padding: 16 }, questTop: { flexDirection: 'row', justifyContent: 'space-between' }, questLabel: { color: '#72DCEF', fontSize: 8, fontWeight: '900', letterSpacing: 1.2 }, questCount: { color: '#9CEBFA', fontSize: 9, fontWeight: '900' }, questTitle: { color: '#F4FBFD', fontSize: 17, fontWeight: '900', marginTop: 5 }, questBody: { color: '#758F99', fontSize: 9, marginTop: 6 },
  stats: { flexDirection: 'row', gap: 7, paddingHorizontal: 18, marginTop: 11 }, stat: { flex: 1, minHeight: 76, borderRadius: 19, borderWidth: 1, borderColor: '#173B49', backgroundColor: '#081D28', alignItems: 'center', justifyContent: 'center', padding: 4 }, statNumber: { color: '#F5FBFD', fontSize: 20, fontWeight: '900' }, statLabel: { color: '#71909B', fontSize: 7, fontWeight: '900', letterSpacing: 0.8, marginTop: 3 },
  sectionRow: { marginTop: 28, marginHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, sectionTitleInline: { color: '#F5FBFD', fontSize: 22, fontWeight: '900' }, sectionMeta: { color: '#67838E', fontSize: 9, fontWeight: '800' }, sectionAction: { color: '#80E2F4', fontSize: 12, fontWeight: '900', paddingVertical: 7, paddingLeft: 14 },
  continueCard: { marginHorizontal: 18, marginTop: 12, borderRadius: 24, borderWidth: 1, borderColor: '#1D4757', backgroundColor: '#09222D', padding: 16, flexDirection: 'row', alignItems: 'center', gap: 13 }, continueIcon: { width: 52, height: 64, borderRadius: 15, backgroundColor: '#123442', alignItems: 'center', justifyContent: 'center' }, continueIconText: { color: '#A9F0FE', fontSize: 26 }, continueLabel: { color: '#72DCEF', fontSize: 8, fontWeight: '900', letterSpacing: 1.3 }, continueTitle: { color: '#F1FAFD', fontSize: 15, fontWeight: '900', marginTop: 4 }, progressTrack: { height: 6, borderRadius: 99, backgroundColor: '#143540', overflow: 'hidden', marginTop: 9 }, progressFill: { height: '100%', borderRadius: 99, backgroundColor: '#9DEBFB' }, progressCopy: { color: '#708C97', fontSize: 9, marginTop: 5 }, chevron: { color: '#86E9FC', fontSize: 29 },
  sectionTitle: { color: '#F5FBFD', fontSize: 22, fontWeight: '900', marginTop: 28, marginHorizontal: 20, marginBottom: 14 }, grid: { paddingHorizontal: 18, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 }, card: { width: '48%', minHeight: 151, backgroundColor: '#0A202B', borderRadius: 24, borderWidth: 1, borderColor: '#193D4C', padding: 17 }, iconBubble: { width: 46, height: 46, borderRadius: 16, backgroundColor: '#102F3C', alignItems: 'center', justifyContent: 'center' }, cardIcon: { color: '#C7F4FC', fontSize: 24 }, cardTitle: { color: '#F5FBFD', fontSize: 16, fontWeight: '900', marginTop: 15 }, cardSubtitle: { color: '#8FAAB5', fontSize: 11, lineHeight: 16, marginTop: 5 },
  characterRow: { paddingHorizontal: 20, gap: 12, paddingBottom: 6 }, characterCard: { width: 145, height: 205, borderRadius: 24, overflow: 'hidden', backgroundColor: '#0B202B', borderWidth: 1, borderColor: '#193E4D' }, characterImage: { width: '100%', height: '100%', resizeMode: 'cover' }, characterShade: { ...StyleSheet.absoluteFillObject }, characterNameWrap: { position: 'absolute', left: 14, right: 14, bottom: 13, flexDirection: 'row', alignItems: 'center', gap: 8 }, characterDot: { width: 7, height: 7, borderRadius: 99 }, characterName: { color: '#FFFFFF', fontWeight: '900', fontSize: 16 }, characterHouse: { color: '#9CB4BE', fontWeight: '800', fontSize: 8, letterSpacing: 0.7, marginTop: 2 },
});
