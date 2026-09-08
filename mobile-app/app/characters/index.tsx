import { router } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { characters } from '../../lib/tidefall';

export default function CharactersScreen() {
  return (
    <LinearGradient colors={['#041019', '#071A25', '#041019']} style={styles.bg}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.back} onPress={() => router.back()}><Text style={styles.backText}>‹</Text></TouchableOpacity>
          <Text style={styles.kicker}>THE CORE FOUR</Text>
          <Text style={styles.title}>Meet the students at the centre of Tidefall.</Text>
          <Text style={styles.body}>Character identity now comes from the same canon source used across the rest of the app.</Text>
          <View style={styles.grid}>
            {characters.map((character) => (
              <TouchableOpacity key={character.slug} style={styles.card} activeOpacity={0.86} onPress={() => router.push(`/characters/${character.slug}` as never)}>
                <Image source={{ uri: character.image }} style={styles.image} />
                <LinearGradient colors={['transparent', 'rgba(3,13,19,0.98)']} style={styles.shade} />
                <View style={styles.cardCopy}>
                  <View style={[styles.dot, { backgroundColor: character.tint }]} />
                  <Text style={styles.name}>{character.fullName}</Text>
                  <Text style={styles.tag}>{character.house} · {character.magic}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 }, safe: { flex: 1 }, content: { padding: 18, paddingBottom: 120 },
  back: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#0A202B', borderWidth: 1, borderColor: '#1B4050', alignItems: 'center', justifyContent: 'center' }, backText: { color: '#fff', fontSize: 34, lineHeight: 37, marginTop: -3 },
  kicker: { color: '#79E2F5', fontWeight: '900', letterSpacing: 2.2, fontSize: 10, marginTop: 24 }, title: { color: '#F3FBFE', fontSize: 31, lineHeight: 37, fontWeight: '900', marginTop: 8 }, body: { color: '#9DB3BE', fontSize: 14, lineHeight: 21, marginTop: 10, marginBottom: 22 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 }, card: { width: '48%', height: 265, borderRadius: 25, overflow: 'hidden', backgroundColor: '#0A202B', borderWidth: 1, borderColor: '#193E4D' }, image: { width: '100%', height: '100%', resizeMode: 'cover' }, shade: { ...StyleSheet.absoluteFillObject }, cardCopy: { position: 'absolute', left: 14, right: 14, bottom: 15 }, dot: { width: 7, height: 7, borderRadius: 99, marginBottom: 7 }, name: { color: '#fff', fontSize: 15, fontWeight: '900' }, tag: { color: '#9CB5C0', fontSize: 9, fontWeight: '800', marginTop: 4, textTransform: 'uppercase' },
});
