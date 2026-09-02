import { router, useLocalSearchParams } from 'expo-router';
import { ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

const ASSET = 'https://tidefall.com.au/assets';

type Character = {
  name: string;
  fullName: string;
  image: string;
  tint: string;
  label: string;
  summary: string;
  traits: string[];
  item: string;
  magic: string;
  quote: string;
};

const characters: Record<string, Character> = {
  harper: {
    name: 'Harper', fullName: 'Harper Vale', image: `${ASSET}/harper.png`, tint: '#F4A7C5', label: 'MOMENTUM · POWER',
    summary: 'Fast-moving, funny and instinctive. Harper tends to act before a room has finished deciding what the problem is.',
    traits: ['Bold', 'Quick-thinking', 'Loyal'], item: 'Old key', magic: 'Power and instinct', quote: 'If the corridor moved once, it can move again.'
  },
  jasper: {
    name: 'Jasper', fullName: 'Jasper Holloway', image: `${ASSET}/jasper.png`, tint: '#F6C86A', label: 'PATTERNS · TITAN-SENSE',
    summary: 'Careful, curious and persistent. Jasper notices patterns most people ignore and keeps pulling at them until something answers.',
    traits: ['Curious', 'Persistent', 'Protective'], item: 'Necklace', magic: 'Titan-sense', quote: 'That is not random. It only looks random.'
  },
  lily: {
    name: 'Lily', fullName: 'Lily Hart', image: `${ASSET}/lily.png`, tint: '#A8E6FF', label: 'LATE ENTRY · TITAN-SENSE',
    summary: 'Quiet at first and much stronger than she expects. Lily arrives late to Tidefall and quickly becomes impossible for the Academy to ignore.',
    traits: ['Kind', 'Observant', 'Powerful'], item: 'Heart hair clip', magic: 'Titan-sense', quote: 'I heard it before I knew what hearing it meant.'
  },
  ava: {
    name: 'Ava', fullName: 'Ava Rees', image: `${ASSET}/ava.png`, tint: '#8ED6A7', label: 'EVIDENCE · PRECISION',
    summary: 'Observant, logical and exact. Ava trusts evidence, remembers details and is usually the first person to notice when the story does not add up.',
    traits: ['Precise', 'Logical', 'Brave'], item: 'Scrunchie', magic: 'Control and precision', quote: 'We have facts. Start there.'
  },
};

export default function CharacterScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const character = characters[String(slug || '').toLowerCase()];

  if (!character) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.missing}>
          <Text style={styles.title}>Character not found.</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}><Text style={styles.backText}>GO BACK</Text></TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ImageBackground source={{ uri: character.image }} style={styles.hero} imageStyle={styles.heroImage}>
          <LinearGradient colors={['rgba(2,10,16,0.05)', 'rgba(2,10,16,0.32)', '#041019']} style={styles.heroShade}>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" style={styles.close} onPress={() => router.back()}>
              <Text style={styles.closeText}>‹</Text>
            </TouchableOpacity>
            <View>
              <View style={[styles.pill, { borderColor: character.tint }]}><Text style={[styles.pillText, { color: character.tint }]}>{character.label}</Text></View>
              <Text style={styles.title}>{character.fullName}</Text>
              <Text style={styles.summary}>{character.summary}</Text>
            </View>
          </LinearGradient>
        </ImageBackground>

        <View style={styles.statRow}>
          <View style={styles.stat}><Text style={styles.statLabel}>SIGNATURE ITEM</Text><Text style={styles.statValue}>{character.item}</Text></View>
          <View style={styles.stat}><Text style={styles.statLabel}>MAGIC</Text><Text style={styles.statValue}>{character.magic}</Text></View>
        </View>

        <Text style={styles.sectionTitle}>Traits</Text>
        <View style={styles.traits}>{character.traits.map((trait) => <View key={trait} style={styles.trait}><Text style={styles.traitText}>{trait}</Text></View>)}</View>

        <View style={styles.quoteCard}>
          <Text style={[styles.quoteMark, { color: character.tint }]}>“</Text>
          <Text style={styles.quote}>{character.quote}</Text>
          <Text style={styles.quoteName}>— {character.name}</Text>
        </View>

        <TouchableOpacity style={styles.relationshipButton} activeOpacity={0.86} onPress={() => router.push('/explore')}>
          <Text style={styles.relationshipLabel}>EXPLORE MORE</Text>
          <Text style={styles.relationshipTitle}>Quizzes, relationships and discoveries</Text>
          <Text style={styles.relationshipArrow}>›</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#041019' },
  content: { paddingBottom: 120 },
  hero: { height: 570, justifyContent: 'flex-end' },
  heroImage: { resizeMode: 'cover' },
  heroShade: { flex: 1, justifyContent: 'space-between', padding: 20, paddingTop: 8, paddingBottom: 28 },
  close: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(4,16,25,0.72)', borderWidth: 1, borderColor: '#294957', alignItems: 'center', justifyContent: 'center' },
  closeText: { color: '#FFFFFF', fontSize: 35, lineHeight: 38, marginTop: -3 },
  pill: { alignSelf: 'flex-start', borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7, backgroundColor: 'rgba(4,16,25,0.65)' },
  pillText: { fontSize: 10, fontWeight: '900', letterSpacing: 1.4 },
  title: { color: '#FFFFFF', fontSize: 40, lineHeight: 44, fontWeight: '900', marginTop: 12 },
  summary: { color: '#C6DCE5', fontSize: 15, lineHeight: 22, marginTop: 10, maxWidth: 520 },
  statRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 18, marginTop: 8 },
  stat: { flex: 1, minHeight: 105, borderRadius: 22, backgroundColor: '#0A202B', borderWidth: 1, borderColor: '#1A3C4B', padding: 16 },
  statLabel: { color: '#6EDCF2', fontSize: 9, fontWeight: '900', letterSpacing: 1.5 },
  statValue: { color: '#F4FBFD', fontSize: 15, fontWeight: '800', marginTop: 9 },
  sectionTitle: { color: '#F5FBFD', fontSize: 22, fontWeight: '900', marginHorizontal: 20, marginTop: 28, marginBottom: 13 },
  traits: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, paddingHorizontal: 18 },
  trait: { borderRadius: 999, backgroundColor: '#0A2532', borderWidth: 1, borderColor: '#1B4656', paddingHorizontal: 15, paddingVertical: 10 },
  traitText: { color: '#DDF7FC', fontSize: 12, fontWeight: '800' },
  quoteCard: { margin: 18, marginTop: 28, borderRadius: 26, backgroundColor: '#081D28', borderWidth: 1, borderColor: '#193B49', padding: 22 },
  quoteMark: { fontSize: 44, fontWeight: '900', lineHeight: 40 },
  quote: { color: '#F4FBFD', fontSize: 20, lineHeight: 28, fontWeight: '800', marginTop: 3 },
  quoteName: { color: '#8CA6B1', fontSize: 12, fontWeight: '700', marginTop: 12 },
  relationshipButton: { marginHorizontal: 18, borderRadius: 24, backgroundColor: '#0A2532', borderWidth: 1, borderColor: '#1D4A5A', padding: 20, paddingRight: 52 },
  relationshipLabel: { color: '#78DDF1', fontSize: 10, fontWeight: '900', letterSpacing: 1.7 },
  relationshipTitle: { color: '#F3FBFD', fontSize: 18, fontWeight: '900', marginTop: 6 },
  relationshipArrow: { position: 'absolute', right: 20, top: 23, color: '#82E7F9', fontSize: 34 },
  missing: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center' },
  backButton: { marginTop: 20, borderRadius: 16, backgroundColor: '#C7F6FF', paddingHorizontal: 20, paddingVertical: 13 },
  backText: { color: '#06212C', fontWeight: '900', fontSize: 11, letterSpacing: 1.3 },
});
