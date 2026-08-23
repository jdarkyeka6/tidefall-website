import { router } from 'expo-router';
import { Image, ImageBackground, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

const ASSET = 'https://tidefall.com.au/assets';
const SITE = 'https://tidefall.com.au';

const characters = [
  { name: 'Harper', slug: 'harper', image: `${ASSET}/harper.png`, tint: '#F4A7C5' },
  { name: 'Jasper', slug: 'jasper', image: `${ASSET}/jasper.png`, tint: '#F6C86A' },
  { name: 'Lily', slug: 'lily', image: `${ASSET}/lily.png`, tint: '#A8E6FF' },
  { name: 'Ava', slug: 'ava', image: `${ASSET}/ava.png`, tint: '#8ED6A7' },
];

const cards = [
  { title: 'Enter the Academy', subtitle: 'Rooms, dorms, secrets and maps', icon: '🏰', action: () => router.push('/academy') },
  { title: 'Cast Magic', subtitle: 'Train and discover spells', icon: '✦', action: () => router.push('/magic') },
  { title: 'Explore Tidefall', subtitle: 'Quizzes, lore, maps & more', icon: '⌁', action: () => router.push('/explore') },
  { title: 'Books', subtitle: 'Continue the story', icon: '▤', action: () => Linking.openURL(`${SITE}/books`) },
];

export default function HomeScreen() {
  return (
    <LinearGradient colors={['#041019', '#071A25', '#041019']} style={styles.background}>
      <SafeAreaView edges={['top']} style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <ImageBackground source={{ uri: `${ASSET}/hero.png` }} style={styles.hero} imageStyle={styles.heroImage}>
            <LinearGradient colors={['rgba(3,12,18,0.02)', 'rgba(3,12,18,0.25)', '#041019']} style={styles.heroShade}>
              <View style={styles.heroTop}>
                <Text style={styles.eyebrow}>WELCOME TO</Text>
                <Text style={styles.title}>TIDEFALL</Text>
                <Text style={styles.tagline}>The things the sea refuses to explain.</Text>
              </View>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Enter Tidefall Academy"
                style={styles.heroButton}
                activeOpacity={0.85}
                onPress={() => router.push('/academy')}
              >
                <Text style={styles.heroButtonText}>ENTER THE WORLD</Text>
              </TouchableOpacity>
            </LinearGradient>
          </ImageBackground>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Open Explore"
            style={styles.tideStrip}
            activeOpacity={0.86}
            onPress={() => router.push('/explore')}
          >
            <Text style={styles.tideGlyph}>≈</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.tideLabel}>THE TIDE IS MOVING</Text>
              <Text style={styles.tideCopy}>A new discovery is waiting today.</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitleInline}>Meet the four</Text>
            <TouchableOpacity accessibilityRole="link" onPress={() => Linking.openURL(`${SITE}/students`)}>
              <Text style={styles.sectionAction}>See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.characterRow}>
            {characters.map((character) => (
              <TouchableOpacity
                key={character.name}
                accessibilityRole="link"
                accessibilityLabel={`Open ${character.name}'s character profile`}
                style={styles.characterCard}
                activeOpacity={0.85}
                onPress={() => Linking.openURL(`${SITE}/characters/${character.slug}`)}
              >
                <Image source={{ uri: character.image }} style={styles.characterImage} />
                <LinearGradient colors={['transparent', 'rgba(3,13,19,0.96)']} style={styles.characterShade} />
                <View style={styles.characterNameWrap}>
                  <View style={[styles.characterDot, { backgroundColor: character.tint }]} />
                  <Text style={styles.characterName}>{character.name}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.sectionTitle}>Explore</Text>
          <View style={styles.grid}>
            {cards.map((card) => (
              <TouchableOpacity
                key={card.title}
                accessibilityRole="button"
                accessibilityLabel={card.title}
                style={styles.card}
                activeOpacity={0.82}
                onPress={card.action}
              >
                <View style={styles.iconBubble}><Text style={styles.cardIcon}>{card.icon}</Text></View>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Explore Tidefall Academy"
            activeOpacity={0.88}
            onPress={() => router.push('/academy')}
          >
            <ImageBackground source={{ uri: `${ASSET}/tidefall-mobile-hero.webp` }} style={styles.feature} imageStyle={styles.featureImage}>
              <LinearGradient colors={['rgba(5,17,25,0.12)', 'rgba(5,17,25,0.92)']} style={styles.featureShade}>
                <Text style={styles.featureLabel}>ACADEMY</Text>
                <Text style={styles.featureTitle}>There are places you haven't found yet.</Text>
                <Text style={styles.featureBody}>Explore rooms, hidden corridors, dorms and secrets across Tidefall Academy.</Text>
              </LinearGradient>
            </ImageBackground>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  safe: { flex: 1 },
  content: { paddingBottom: 120 },
  hero: { height: 440, justifyContent: 'flex-end' },
  heroImage: { resizeMode: 'cover' },
  heroShade: { flex: 1, justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 25, paddingBottom: 28 },
  heroTop: { marginTop: 4 },
  eyebrow: { color: '#9BEFFF', fontSize: 11, letterSpacing: 4, fontWeight: '800' },
  title: { color: '#FFFFFF', fontSize: 51, letterSpacing: 5, fontWeight: '900', marginTop: 3, textShadowColor: 'rgba(0,0,0,0.35)', textShadowRadius: 12 },
  tagline: { color: '#D8EEF5', fontSize: 15, marginTop: 3 },
  heroButton: { alignSelf: 'flex-start', backgroundColor: 'rgba(214,248,255,0.96)', paddingHorizontal: 21, paddingVertical: 14, borderRadius: 18 },
  heroButtonText: { color: '#06202B', fontWeight: '900', fontSize: 12, letterSpacing: 1.3 },
  tideStrip: { marginHorizontal: 18, marginTop: -3, padding: 17, backgroundColor: '#0A2532', borderRadius: 22, borderWidth: 1, borderColor: '#1E4B5B', flexDirection: 'row', alignItems: 'center', gap: 13 },
  tideGlyph: { color: '#8BEAFF', fontSize: 32, fontWeight: '300' },
  tideLabel: { color: '#79DDF1', fontSize: 10, fontWeight: '900', letterSpacing: 1.8 },
  tideCopy: { color: '#E9F9FD', fontSize: 14, fontWeight: '700', marginTop: 3 },
  chevron: { color: '#86E9FC', fontSize: 28 },
  sectionRow: { marginTop: 28, marginHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitleInline: { color: '#F5FBFD', fontSize: 22, fontWeight: '900' },
  sectionTitle: { color: '#F5FBFD', fontSize: 22, fontWeight: '900', marginTop: 28, marginHorizontal: 20, marginBottom: 14 },
  sectionAction: { color: '#80E2F4', fontSize: 13, fontWeight: '800', paddingVertical: 7, paddingLeft: 14 },
  characterRow: { paddingHorizontal: 20, gap: 12 },
  characterCard: { width: 145, height: 205, borderRadius: 24, overflow: 'hidden', backgroundColor: '#0B202B', borderWidth: 1, borderColor: '#193E4D' },
  characterImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  characterShade: { ...StyleSheet.absoluteFillObject },
  characterNameWrap: { position: 'absolute', left: 14, right: 14, bottom: 13, flexDirection: 'row', alignItems: 'center', gap: 7 },
  characterDot: { width: 7, height: 7, borderRadius: 99 },
  characterName: { color: '#FFFFFF', fontWeight: '900', fontSize: 16 },
  grid: { paddingHorizontal: 18, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  card: { width: '48%', minHeight: 165, backgroundColor: '#0A202B', borderRadius: 24, borderWidth: 1, borderColor: '#193D4C', padding: 17 },
  iconBubble: { width: 46, height: 46, borderRadius: 16, backgroundColor: '#102F3C', alignItems: 'center', justifyContent: 'center' },
  cardIcon: { color: '#C7F4FC', fontSize: 24 },
  cardTitle: { color: '#F5FBFD', fontSize: 16, fontWeight: '900', marginTop: 15 },
  cardSubtitle: { color: '#8FAAB5', fontSize: 12, lineHeight: 17, marginTop: 5 },
  feature: { marginHorizontal: 18, marginTop: 26, height: 260, borderRadius: 28, overflow: 'hidden' },
  featureImage: { borderRadius: 28, resizeMode: 'cover' },
  featureShade: { flex: 1, justifyContent: 'flex-end', padding: 22 },
  featureLabel: { color: '#84E7FA', fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  featureTitle: { color: '#FFFFFF', fontSize: 23, lineHeight: 29, fontWeight: '900', marginTop: 7 },
  featureBody: { color: '#C2DCE5', fontSize: 13, lineHeight: 19, marginTop: 7 },
});
