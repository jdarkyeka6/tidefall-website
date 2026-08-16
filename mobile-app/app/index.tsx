import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

const cards = [
  { title: 'Enter the Academy', subtitle: 'Explore Tidefall Academy', icon: '🏰' },
  { title: 'Cast Magic', subtitle: 'Train and discover spells', icon: '✨' },
  { title: 'Explore Tidefall', subtitle: 'Quizzes, secrets, maps & more', icon: '🧭' },
  { title: 'Books', subtitle: 'Continue the story', icon: '📚' },
];

export default function HomeScreen() {
  return (
    <LinearGradient colors={['#05111A', '#082331', '#06141E']} style={styles.background}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.eyebrow}>WELCOME TO</Text>
          <Text style={styles.title}>TIDEFALL</Text>
          <Text style={styles.tagline}>The things the sea refuses to explain.</Text>

          <View style={styles.tideCard}>
            <Text style={styles.tideLabel}>THE TIDE IS MOVING</Text>
            <Text style={styles.tideTitle}>Your journey begins here.</Text>
            <Text style={styles.tideBody}>Discover the Academy, learn magic, uncover secrets and follow the story.</Text>
            <TouchableOpacity style={styles.primaryButton} activeOpacity={0.8}>
              <Text style={styles.primaryButtonText}>ENTER TIDEFALL</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Explore</Text>
          <View style={styles.grid}>
            {cards.map((card) => (
              <TouchableOpacity key={card.title} style={styles.card} activeOpacity={0.8}>
                <Text style={styles.cardIcon}>{card.icon}</Text>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.dailyCard}>
            <Text style={styles.dailyLabel}>TODAY IN TIDEFALL</Text>
            <Text style={styles.dailyTitle}>A new discovery is waiting.</Text>
            <Text style={styles.dailyBody}>Come back each day for rotating lore, character facts, secrets and challenges.</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  safe: { flex: 1 },
  content: { padding: 20, paddingBottom: 120 },
  eyebrow: { color: '#83DFF2', fontSize: 12, letterSpacing: 4, fontWeight: '700', marginTop: 14 },
  title: { color: '#F2FBFF', fontSize: 48, letterSpacing: 5, fontWeight: '900', marginTop: 4 },
  tagline: { color: '#9FB6C2', fontSize: 15, marginTop: 3, marginBottom: 26 },
  tideCard: { backgroundColor: 'rgba(14, 47, 62, 0.88)', borderWidth: 1, borderColor: '#27586B', borderRadius: 28, padding: 24 },
  tideLabel: { color: '#71DDF4', fontSize: 11, letterSpacing: 2.4, fontWeight: '800' },
  tideTitle: { color: '#FFFFFF', fontSize: 29, fontWeight: '800', marginTop: 10 },
  tideBody: { color: '#BAD0D9', fontSize: 15, lineHeight: 22, marginTop: 10 },
  primaryButton: { marginTop: 22, backgroundColor: '#B8F4FF', paddingVertical: 15, borderRadius: 16, alignItems: 'center' },
  primaryButtonText: { color: '#06212D', fontSize: 13, fontWeight: '900', letterSpacing: 1.2 },
  sectionTitle: { color: '#F5FBFD', fontSize: 22, fontWeight: '800', marginTop: 30, marginBottom: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  card: { width: '48%', minHeight: 155, backgroundColor: 'rgba(10, 31, 42, 0.92)', borderRadius: 22, borderWidth: 1, borderColor: '#193D4C', padding: 18 },
  cardIcon: { fontSize: 28 },
  cardTitle: { color: '#F5FBFD', fontSize: 16, fontWeight: '800', marginTop: 13 },
  cardSubtitle: { color: '#8FAAB5', fontSize: 12, lineHeight: 17, marginTop: 5 },
  dailyCard: { marginTop: 24, backgroundColor: 'rgba(8, 27, 38, 0.9)', borderRadius: 22, padding: 21, borderWidth: 1, borderColor: '#183A49' },
  dailyLabel: { color: '#76D8ED', fontWeight: '800', fontSize: 11, letterSpacing: 1.8 },
  dailyTitle: { color: '#F4FBFE', fontSize: 20, fontWeight: '800', marginTop: 8 },
  dailyBody: { color: '#94ACB7', fontSize: 13, lineHeight: 19, marginTop: 7 },
});
