import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { emptyProgress, loadProgress, type TidefallProgress } from '../lib/progress';
import { secrets } from '../lib/world';

export default function SecretsScreen() {
  const [progress, setProgress] = useState<TidefallProgress>(emptyProgress);

  useFocusEffect(useCallback(() => {
    let active = true;
    loadProgress().then((next) => { if (active) setProgress(next); });
    return () => { active = false; };
  }, []));

  return (
    <LinearGradient colors={['#031018', '#071923', '#031018']} style={styles.bg}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.back} onPress={() => router.back()}><Text style={styles.backText}>‹</Text></TouchableOpacity>
          <Text style={styles.kicker}>SECRET ARCHIVE</Text>
          <Text style={styles.title}>Things Tidefall did not volunteer.</Text>
          <Text style={styles.body}>Secrets are found by doing strange things in ordinary places. Locked entries keep most of their mouth shut.</Text>

          <View style={styles.summary}>
            <Text style={styles.summaryGlyph}>?</Text>
            <View style={{ flex: 1 }}><Text style={styles.summaryLabel}>COLLECTION</Text><Text style={styles.summaryTitle}>{progress.foundSecrets.length} of {secrets.length} secrets found</Text></View>
          </View>

          {secrets.map((secret, index) => {
            const found = progress.foundSecrets.includes(secret.slug);
            return (
              <View key={secret.slug} style={[styles.secretCard, found && styles.secretFound]}>
                <View style={[styles.number, found && styles.numberFound]}><Text style={[styles.numberText, found && styles.numberTextFound]}>{String(index + 1).padStart(2, '0')}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.source}>{found ? secret.source.toUpperCase() : 'UNKNOWN SOURCE'}</Text>
                  <Text style={styles.secretTitle}>{found ? secret.title : 'Unknown secret'}</Text>
                  <Text style={styles.clue}>{found ? secret.clue : 'Keep exploring. The app will tell you when you have actually found this one.'}</Text>
                  <Text style={styles.status}>{found ? `FOUND · +${secret.points} TIDE POINTS` : 'LOCKED'}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 }, safe: { flex: 1 }, content: { padding: 20, paddingBottom: 120 },
  back: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#071A24', borderWidth: 1, borderColor: '#243D47', alignItems: 'center', justifyContent: 'center' }, backText: { color: '#fff', fontSize: 34, lineHeight: 37, marginTop: -3 },
  kicker: { color: '#718E99', fontSize: 10, fontWeight: '900', letterSpacing: 2.3, marginTop: 24 }, title: { color: '#E9F5F8', fontSize: 33, lineHeight: 39, fontWeight: '900', marginTop: 7 }, body: { color: '#7F99A4', fontSize: 14, lineHeight: 21, marginTop: 8 },
  summary: { marginTop: 22, borderRadius: 24, borderWidth: 1, borderStyle: 'dashed', borderColor: '#31505C', backgroundColor: '#071A23', padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14 }, summaryGlyph: { color: '#718F99', fontSize: 38, fontWeight: '900' }, summaryLabel: { color: '#6D8994', fontSize: 8, fontWeight: '900', letterSpacing: 1.5 }, summaryTitle: { color: '#DDECF0', fontSize: 17, fontWeight: '900', marginTop: 4 },
  secretCard: { marginTop: 11, minHeight: 126, borderRadius: 22, borderWidth: 1, borderStyle: 'dashed', borderColor: '#263E48', backgroundColor: '#061720', padding: 15, flexDirection: 'row', gap: 13 }, secretFound: { borderStyle: 'solid', borderColor: '#245465', backgroundColor: '#09222D' },
  number: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, borderColor: '#314852', alignItems: 'center', justifyContent: 'center' }, numberFound: { backgroundColor: '#C5F5FE', borderColor: '#C5F5FE' }, numberText: { color: '#637C86', fontSize: 9, fontWeight: '900' }, numberTextFound: { color: '#06212C' },
  source: { color: '#6F8C97', fontSize: 8, fontWeight: '900', letterSpacing: 1.4 }, secretTitle: { color: '#DCE9ED', fontSize: 16, fontWeight: '900', marginTop: 4 }, clue: { color: '#758E98', fontSize: 11, lineHeight: 17, marginTop: 5 }, status: { color: '#6EBDCD', fontSize: 8, fontWeight: '900', letterSpacing: 1, marginTop: 8 },
});
