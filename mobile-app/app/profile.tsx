import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View } from 'react-native';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <Text style={styles.kicker}>YOUR TIDEFALL</Text>
        <Text style={styles.title}>Your journey lives here.</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Profile coming next</Text>
          <Text style={styles.cardBody}>Your Order, discoveries, spells, achievements and reading progress will be collected here.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#06141E' },
  content: { padding: 22 },
  kicker: { color: '#79E2F5', fontWeight: '800', letterSpacing: 2.2, fontSize: 12, marginTop: 12 },
  title: { color: '#F3FBFE', fontSize: 31, lineHeight: 38, fontWeight: '900', marginTop: 9 },
  card: { marginTop: 24, borderRadius: 24, borderWidth: 1, borderColor: '#1B4050', backgroundColor: '#0A202B', padding: 22 },
  cardTitle: { color: '#F3FBFE', fontSize: 20, fontWeight: '800' },
  cardBody: { color: '#9DB3BE', fontSize: 14, lineHeight: 21, marginTop: 9 },
});
