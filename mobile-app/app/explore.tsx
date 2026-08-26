import { SafeAreaView } from 'react-native-safe-area-context';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

const SITE = 'https://tidefall.com.au';

const items = [
  { title: 'Which character are you?', url: `${SITE}/character-quiz` },
  { title: 'Would you survive Tidefall?', url: `${SITE}/survive` },
  { title: 'Secrets & discoveries', url: `${SITE}/secrets` },
  { title: 'Character relationship map', url: `${SITE}/relationships` },
];

export default function ExploreScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>EXPLORE</Text>
        <Text style={styles.title}>Tidefall is bigger than the story.</Text>
        <Text style={styles.body}>Quizzes, secrets, maps, character discoveries and Academy lore will live here.</Text>

        {items.map((item) => (
          <TouchableOpacity
            key={item.title}
            accessibilityRole="link"
            accessibilityLabel={`Open ${item.title}`}
            style={styles.card}
            activeOpacity={0.84}
            onPress={() => Linking.openURL(item.url)}
          >
            <Text style={styles.cardText}>{item.title}</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#06141E' },
  content: { padding: 22, paddingBottom: 120 },
  kicker: { color: '#79E2F5', fontWeight: '800', letterSpacing: 2.2, fontSize: 12, marginTop: 12 },
  title: { color: '#F3FBFE', fontSize: 31, lineHeight: 38, fontWeight: '900', marginTop: 9 },
  body: { color: '#9DB3BE', fontSize: 15, lineHeight: 22, marginTop: 12, marginBottom: 24 },
  card: { minHeight: 72, paddingHorizontal: 18, marginBottom: 12, borderRadius: 20, borderWidth: 1, borderColor: '#1B4050', backgroundColor: '#0A202B', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardText: { color: '#EEF9FC', fontSize: 16, fontWeight: '700' },
  arrow: { color: '#83E8FA', fontSize: 30, fontWeight: '300' },
});
