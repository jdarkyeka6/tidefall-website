import { ImageBackground, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

const ASSET = 'https://tidefall.com.au/assets';
const SITE = 'https://tidefall.com.au';

const places = [
  { title: 'Dorms', copy: 'Rooms, belongings, house details and hidden corners.', icon: '🛏️', url: `${SITE}/academy-dorms` },
  { title: 'Classrooms', copy: 'Magic, lessons, rules and teachers.', icon: '📖', url: `${SITE}/academy-classes` },
  { title: 'Hidden corridors', copy: 'Not every route appears on the map.', icon: '🗝️', url: `${SITE}/academy-map` },
  { title: 'Riptide grounds', copy: 'Explore the sport, teams and match lore.', icon: '🌊', url: `${SITE}/riptide-player-quiz` },
];

export default function AcademyScreen() {
  const open = (url: string) => Linking.openURL(url);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ImageBackground source={{ uri: `${ASSET}/tidefall-mobile-hero.webp` }} style={styles.hero} imageStyle={styles.heroImage}>
          <LinearGradient colors={['rgba(3,13,19,0.05)', 'rgba(3,13,19,0.92)']} style={styles.shade}>
            <Text style={styles.kicker}>TIDEFALL ACADEMY</Text>
            <Text style={styles.title}>Enter the Academy.</Text>
            <Text style={styles.body}>Rooms, secrets, students and places the official map would rather you ignored.</Text>
          </LinearGradient>
        </ImageBackground>

        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>ACADEMY STATUS</Text>
          <Text style={styles.statusTitle}>The castle is open.</Text>
          <Text style={styles.statusBody}>Start with the known rooms. The stranger parts come later.</Text>
        </View>

        <Text style={styles.sectionTitle}>Places</Text>
        <View style={styles.grid}>
          {places.map((place) => (
            <TouchableOpacity
              key={place.title}
              accessibilityRole="link"
              accessibilityLabel={`Open ${place.title}`}
              style={styles.card}
              activeOpacity={0.84}
              onPress={() => open(place.url)}
            >
              <Text style={styles.icon}>{place.icon}</Text>
              <Text style={styles.cardTitle}>{place.title}</Text>
              <Text style={styles.cardCopy}>{place.copy}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          accessibilityRole="link"
          accessibilityLabel="Open Academy discoveries"
          style={styles.secretCard}
          activeOpacity={0.84}
          onPress={() => open(`${SITE}/secrets`)}
        >
          <Text style={styles.secretGlyph}>◌</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.secretLabel}>DISCOVERY</Text>
            <Text style={styles.secretTitle}>Some doors only appear once.</Text>
            <Text style={styles.secretCopy}>Open the Academy secrets and discoveries.</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#041019' },
  content: { paddingBottom: 120 },
  hero: { height: 360, justifyContent: 'flex-end' },
  heroImage: { resizeMode: 'cover' },
  shade: { flex: 1, justifyContent: 'flex-end', padding: 22 },
  kicker: { color: '#8FEAFF', fontSize: 11, fontWeight: '900', letterSpacing: 2.5 },
  title: { color: '#FFFFFF', fontSize: 39, lineHeight: 43, fontWeight: '900', marginTop: 8 },
  body: { color: '#C6DCE5', fontSize: 15, lineHeight: 22, marginTop: 10 },
  statusCard: { margin: 18, marginTop: 20, borderRadius: 24, padding: 20, backgroundColor: '#0A2532', borderWidth: 1, borderColor: '#1B4656' },
  statusLabel: { color: '#78DDF2', fontSize: 10, fontWeight: '900', letterSpacing: 1.8 },
  statusTitle: { color: '#F4FBFE', fontSize: 21, fontWeight: '900', marginTop: 7 },
  statusBody: { color: '#9FB7C2', fontSize: 13, lineHeight: 19, marginTop: 6 },
  sectionTitle: { color: '#F5FBFD', fontSize: 22, fontWeight: '900', marginHorizontal: 20, marginTop: 9, marginBottom: 14 },
  grid: { paddingHorizontal: 18, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  card: { width: '48%', minHeight: 160, backgroundColor: '#09202B', borderRadius: 23, borderWidth: 1, borderColor: '#183D4C', padding: 17 },
  icon: { fontSize: 27 },
  cardTitle: { color: '#F4FBFD', fontSize: 16, fontWeight: '900', marginTop: 14 },
  cardCopy: { color: '#8FA8B3', fontSize: 12, lineHeight: 17, marginTop: 5 },
  secretCard: { marginHorizontal: 18, marginTop: 24, flexDirection: 'row', gap: 15, padding: 20, borderRadius: 24, backgroundColor: '#081C27', borderWidth: 1, borderColor: '#173746', alignItems: 'center' },
  secretGlyph: { color: '#93EEFF', fontSize: 40 },
  secretLabel: { color: '#77DDF1', fontSize: 10, fontWeight: '900', letterSpacing: 1.7 },
  secretTitle: { color: '#F3FBFD', fontSize: 18, fontWeight: '900', marginTop: 5 },
  secretCopy: { color: '#91AAB5', fontSize: 12, lineHeight: 17, marginTop: 4 },
});
