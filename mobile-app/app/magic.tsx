import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

const spells = [
  { name: 'Veyra', symbol: '✦', status: 'Known' },
  { name: 'Sela', symbol: '◌', status: 'Known' },
  { name: 'Tavra', symbol: '⌁', status: 'Known' },
  { name: 'Raska', symbol: '◇', status: 'Known' },
  { name: 'Valka', symbol: '✧', status: 'Known' },
  { name: 'Unknown', symbol: '?', status: 'Hidden' },
];

export default function MagicScreen() {
  return (
    <LinearGradient colors={['#041019', '#071B27', '#041019']} style={styles.bg}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.kicker}>VOICE MAGIC</Text>
          <Text style={styles.title}>Magic</Text>
          <Text style={styles.body}>Speak, discover, train and keep track of what the Tide has taught you.</Text>

          <View style={styles.castCard}>
            <View style={styles.ringOuter}><View style={styles.ringInner}><Text style={styles.mic}>◉</Text></View></View>
            <Text style={styles.castLabel}>CASTING CHAMBER</Text>
            <Text style={styles.castTitle}>Speak a spell.</Text>
            <Text style={styles.castBody}>Voice casting will listen for Tidefall spells and respond with visual feedback.</Text>
            <TouchableOpacity style={styles.castButton} activeOpacity={0.84}><Text style={styles.castButtonText}>BEGIN CASTING</Text></TouchableOpacity>
          </View>

          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Spellbook</Text>
            <Text style={styles.progress}>5 discovered</Text>
          </View>

          <View style={styles.spellGrid}>
            {spells.map((spell) => (
              <TouchableOpacity key={`${spell.name}-${spell.symbol}`} style={[styles.spellCard, spell.status === 'Hidden' && styles.hiddenCard]} activeOpacity={0.84}>
                <Text style={[styles.spellSymbol, spell.status === 'Hidden' && styles.hiddenSymbol]}>{spell.symbol}</Text>
                <Text style={styles.spellName}>{spell.name}</Text>
                <Text style={styles.spellStatus}>{spell.status}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.trainingCard}>
            <Text style={styles.trainingLabel}>TRAINING</Text>
            <Text style={styles.trainingTitle}>Precision before power.</Text>
            <Text style={styles.trainingCopy}>Practice timing, pronunciation and control with short casting challenges.</Text>
            <Text style={styles.trainingArrow}>›</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 }, safe: { flex: 1 }, content: { padding: 22, paddingBottom: 120 },
  kicker: { color: '#7DE3F6', fontSize: 11, fontWeight: '900', letterSpacing: 2.5, marginTop: 12 },
  title: { color: '#F5FCFF', fontSize: 42, fontWeight: '900', marginTop: 6 },
  body: { color: '#9EB6C1', fontSize: 15, lineHeight: 22, marginTop: 7 },
  castCard: { marginTop: 24, borderRadius: 30, padding: 24, alignItems: 'center', backgroundColor: '#0A2633', borderWidth: 1, borderColor: '#205061' },
  ringOuter: { width: 118, height: 118, borderRadius: 70, borderWidth: 1, borderColor: '#2E748A', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(91,220,244,0.05)' },
  ringInner: { width: 82, height: 82, borderRadius: 50, backgroundColor: '#B9F3FF', alignItems: 'center', justifyContent: 'center', shadowColor: '#68E6FF', shadowOpacity: 0.4, shadowRadius: 20 },
  mic: { color: '#06212C', fontSize: 32 },
  castLabel: { color: '#7FE3F7', fontSize: 10, fontWeight: '900', letterSpacing: 1.9, marginTop: 20 },
  castTitle: { color: '#FFFFFF', fontSize: 26, fontWeight: '900', marginTop: 7 },
  castBody: { color: '#A9C0CA', fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: 7 },
  castButton: { marginTop: 18, backgroundColor: '#C7F6FF', borderRadius: 16, paddingVertical: 13, paddingHorizontal: 23 },
  castButtonText: { color: '#06212C', fontWeight: '900', fontSize: 11, letterSpacing: 1.3 },
  sectionRow: { marginTop: 30, marginBottom: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: '#F5FBFD', fontSize: 22, fontWeight: '900' }, progress: { color: '#78DDF1', fontSize: 12, fontWeight: '800' },
  spellGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 11 },
  spellCard: { width: '31%', minHeight: 132, borderRadius: 22, backgroundColor: '#09212C', borderWidth: 1, borderColor: '#1B4454', padding: 14, alignItems: 'center', justifyContent: 'center' },
  hiddenCard: { opacity: 0.58, borderStyle: 'dashed' },
  spellSymbol: { color: '#A8EFFF', fontSize: 34, fontWeight: '300' }, hiddenSymbol: { color: '#6D8792' },
  spellName: { color: '#F1FAFD', fontSize: 14, fontWeight: '900', marginTop: 9 }, spellStatus: { color: '#7895A1', fontSize: 10, marginTop: 3 },
  trainingCard: { marginTop: 24, borderRadius: 24, backgroundColor: '#081D28', borderWidth: 1, borderColor: '#183947', padding: 20, paddingRight: 48 },
  trainingLabel: { color: '#7BDFF2', fontSize: 10, fontWeight: '900', letterSpacing: 1.7 }, trainingTitle: { color: '#F4FBFD', fontSize: 20, fontWeight: '900', marginTop: 6 }, trainingCopy: { color: '#91AAB5', fontSize: 12, lineHeight: 18, marginTop: 5 }, trainingArrow: { position: 'absolute', right: 20, top: '50%', color: '#82E7F9', fontSize: 31 },
});
