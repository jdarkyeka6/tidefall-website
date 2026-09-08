import { useCallback, useRef, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, Vibration, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spells, type Spell } from '../lib/tidefall';
import { castSpell, emptyProgress, loadProgress, saveProgress, type TidefallProgress } from '../lib/progress';

export default function MagicScreen() {
  const [progress, setProgress] = useState<TidefallProgress>(emptyProgress);
  const [selected, setSelected] = useState<Spell>(spells[0]);
  const [charging, setCharging] = useState(false);
  const [status, setStatus] = useState('Choose a spell, then hold the chamber to charge it.');
  const [streak, setStreak] = useState(0);
  const chargeStarted = useRef(0);

  useFocusEffect(useCallback(() => {
    let active = true;
    loadProgress().then((next) => { if (active) setProgress(next); });
    return () => { active = false; };
  }, []));

  function startCharge() {
    chargeStarted.current = Date.now();
    setCharging(true);
    setStatus(`Charging ${selected.name}… keep holding.`);
    Vibration.vibrate(18);
  }

  async function releaseCharge() {
    const heldFor = Date.now() - chargeStarted.current;
    setCharging(false);
    if (heldFor < 450) {
      setStreak(0);
      setStatus('Too quick. Hold the chamber long enough to stabilise the cast.');
      Vibration.vibrate(35);
      return;
    }

    const next = castSpell(progress, selected);
    await saveProgress(next);
    setProgress(next);
    setStreak((value) => value + 1);
    setStatus(`${selected.name} cast successfully. Mastery increased.`);
    Vibration.vibrate([0, 20, 35, 28]);
  }

  const mastery = progress.spellMastery[selected.slug] || 0;
  const discovered = Object.values(progress.spellMastery).filter((value) => value > 0).length;

  return (
    <LinearGradient colors={['#041019', '#071B27', '#041019']} style={styles.bg}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.kicker}>MAGIC TRAINING</Text>
          <Text style={styles.title}>Casting Chamber</Text>
          <Text style={styles.body}>Magic now happens inside the app. Pick a spell, charge the chamber and build mastery over time.</Text>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={`Charge ${selected.name}`}
            activeOpacity={1}
            onPressIn={startCharge}
            onPressOut={releaseCharge}
            style={[styles.castCard, charging && styles.castCardCharging]}
          >
            <View style={[styles.ringOuter, charging && styles.ringOuterCharging]}>
              <View style={[styles.ringInner, charging && styles.ringInnerCharging]}>
                <Text style={styles.castSymbol}>{selected.symbol}</Text>
              </View>
            </View>
            <Text style={styles.castLabel}>{charging ? 'CHARGING' : 'CASTING CHAMBER'}</Text>
            <Text style={styles.castTitle}>{selected.name}</Text>
            <Text style={styles.castDiscipline}>{selected.discipline.toUpperCase()}</Text>
            <Text style={styles.castBody}>{status}</Text>
            <View style={styles.masteryRow}>
              <Text style={styles.masteryLabel}>MASTERY</Text>
              <Text style={styles.masteryValue}>{mastery}%</Text>
            </View>
            <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${Math.max(4, mastery)}%` }]} /></View>
            <View style={[styles.holdButton, charging && styles.holdButtonCharging]}>
              <Text style={styles.holdButtonText}>{charging ? 'HOLD…' : 'HOLD TO CAST'}</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.quickStats}>
            <View style={styles.quickStat}><Text style={styles.quickNumber}>{discovered}</Text><Text style={styles.quickLabel}>SPELLS CAST</Text></View>
            <View style={styles.quickStat}><Text style={styles.quickNumber}>{streak}</Text><Text style={styles.quickLabel}>CAST STREAK</Text></View>
            <View style={styles.quickStat}><Text style={styles.quickNumber}>{progress.tidePoints}</Text><Text style={styles.quickLabel}>TIDE POINTS</Text></View>
          </View>

          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Spellbook</Text>
            <Text style={styles.sectionMeta}>Tap to equip</Text>
          </View>

          <View style={styles.spellGrid}>
            {spells.map((spell) => {
              const value = progress.spellMastery[spell.slug] || 0;
              const active = selected.slug === spell.slug;
              return (
                <TouchableOpacity key={spell.slug} style={[styles.spellCard, active && styles.spellCardActive]} activeOpacity={0.84} onPress={() => { setSelected(spell); setStatus(`Equipped ${spell.name}. Hold the chamber to cast.`); }}>
                  <Text style={[styles.spellSymbol, active && styles.spellSymbolActive]}>{spell.symbol}</Text>
                  <Text style={styles.spellName}>{spell.name}</Text>
                  <Text style={styles.spellDiscipline}>{spell.discipline}</Text>
                  <View style={styles.miniTrack}><View style={[styles.miniFill, { width: `${value}%` }]} /></View>
                  <Text style={styles.spellStatus}>{value ? `${value}% mastery` : 'Not cast yet'}</Text>
                </TouchableOpacity>
              );
            })}
            <View style={styles.hiddenCard}>
              <Text style={styles.hiddenSymbol}>?</Text>
              <Text style={styles.hiddenTitle}>Unknown</Text>
              <Text style={styles.hiddenBody}>The spellbook is not complete.</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.trainingCard} activeOpacity={0.86} onPress={() => router.push('/explore')}>
            <Text style={styles.trainingLabel}>NEXT TARGET</Text>
            <Text style={styles.trainingTitle}>Push {selected.name} to {mastery < 50 ? '50%' : '100%'} mastery.</Text>
            <Text style={styles.trainingCopy}>Successful casts build mastery and Tide Points. Discover can send you somewhere else when you are done training.</Text>
            <Text style={styles.trainingArrow}>›</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 }, safe: { flex: 1 }, content: { padding: 20, paddingBottom: 120 },
  kicker: { color: '#7DE3F6', fontSize: 10, fontWeight: '900', letterSpacing: 2.4, marginTop: 10 }, title: { color: '#F5FCFF', fontSize: 38, lineHeight: 43, fontWeight: '900', marginTop: 6 }, body: { color: '#9EB6C1', fontSize: 14, lineHeight: 21, marginTop: 7 },
  castCard: { marginTop: 24, borderRadius: 30, padding: 23, alignItems: 'center', backgroundColor: '#0A2633', borderWidth: 1, borderColor: '#205061' }, castCardCharging: { backgroundColor: '#0C3140', borderColor: '#70D9EE' },
  ringOuter: { width: 132, height: 132, borderRadius: 72, borderWidth: 1, borderColor: '#2E748A', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(91,220,244,0.05)' }, ringOuterCharging: { borderWidth: 2, borderColor: '#93EEFF', backgroundColor: 'rgba(142,235,251,0.1)' },
  ringInner: { width: 88, height: 88, borderRadius: 50, backgroundColor: '#B9F3FF', alignItems: 'center', justifyContent: 'center', shadowColor: '#68E6FF', shadowOpacity: 0.38, shadowRadius: 20 }, ringInnerCharging: { width: 96, height: 96, borderRadius: 52 }, castSymbol: { color: '#06212C', fontSize: 38, fontWeight: '500' },
  castLabel: { color: '#7FE3F7', fontSize: 9, fontWeight: '900', letterSpacing: 1.9, marginTop: 19 }, castTitle: { color: '#FFFFFF', fontSize: 27, fontWeight: '900', marginTop: 5 }, castDiscipline: { color: '#7696A1', fontSize: 9, fontWeight: '900', letterSpacing: 1.5, marginTop: 3 }, castBody: { color: '#A9C0CA', fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 9, minHeight: 36 },
  masteryRow: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }, masteryLabel: { color: '#6D919E', fontSize: 8, fontWeight: '900', letterSpacing: 1.3 }, masteryValue: { color: '#A5EEFB', fontSize: 10, fontWeight: '900' }, progressTrack: { width: '100%', height: 8, borderRadius: 99, backgroundColor: '#153744', overflow: 'hidden', marginTop: 6 }, progressFill: { height: '100%', borderRadius: 99, backgroundColor: '#9DEBFB' },
  holdButton: { marginTop: 18, backgroundColor: '#C7F6FF', borderRadius: 17, paddingVertical: 14, paddingHorizontal: 25, minWidth: 150, alignItems: 'center' }, holdButtonCharging: { backgroundColor: '#8BEAFF' }, holdButtonText: { color: '#06212C', fontWeight: '900', fontSize: 10, letterSpacing: 1.3 },
  quickStats: { flexDirection: 'row', gap: 9, marginTop: 12 }, quickStat: { flex: 1, minHeight: 78, borderRadius: 20, borderWidth: 1, borderColor: '#173B49', backgroundColor: '#081D28', alignItems: 'center', justifyContent: 'center', padding: 6 }, quickNumber: { color: '#F3FBFD', fontSize: 19, fontWeight: '900' }, quickLabel: { color: '#6F8C97', fontSize: 7, fontWeight: '900', letterSpacing: 0.8, marginTop: 4, textAlign: 'center' },
  sectionRow: { marginTop: 30, marginBottom: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, sectionTitle: { color: '#F5FBFD', fontSize: 22, fontWeight: '900' }, sectionMeta: { color: '#688590', fontSize: 9, fontWeight: '800' },
  spellGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 11 }, spellCard: { width: '48%', minHeight: 168, borderRadius: 23, backgroundColor: '#09212C', borderWidth: 1, borderColor: '#1B4454', padding: 15 }, spellCardActive: { backgroundColor: '#0C2C39', borderColor: '#72DCEF' }, spellSymbol: { color: '#A8EFFF', fontSize: 32, fontWeight: '300' }, spellSymbolActive: { color: '#D9FAFF' }, spellName: { color: '#F1FAFD', fontSize: 15, fontWeight: '900', marginTop: 9 }, spellDiscipline: { color: '#7794A0', fontSize: 9, fontWeight: '800', marginTop: 2 }, miniTrack: { height: 5, borderRadius: 99, backgroundColor: '#143541', overflow: 'hidden', marginTop: 13 }, miniFill: { height: '100%', borderRadius: 99, backgroundColor: '#8BE8F9' }, spellStatus: { color: '#6F8D98', fontSize: 9, marginTop: 6 },
  hiddenCard: { width: '48%', minHeight: 168, borderRadius: 23, backgroundColor: '#071A23', borderWidth: 1, borderStyle: 'dashed', borderColor: '#2B414A', padding: 15, justifyContent: 'center' }, hiddenSymbol: { color: '#607984', fontSize: 30, fontWeight: '900' }, hiddenTitle: { color: '#B5C7CD', fontSize: 15, fontWeight: '900', marginTop: 7 }, hiddenBody: { color: '#657E88', fontSize: 10, lineHeight: 15, marginTop: 4 },
  trainingCard: { marginTop: 24, borderRadius: 24, backgroundColor: '#081D28', borderWidth: 1, borderColor: '#183947', padding: 20, paddingRight: 48 }, trainingLabel: { color: '#7BDFF2', fontSize: 9, fontWeight: '900', letterSpacing: 1.7 }, trainingTitle: { color: '#F4FBFD', fontSize: 19, fontWeight: '900', marginTop: 6 }, trainingCopy: { color: '#91AAB5', fontSize: 11, lineHeight: 17, marginTop: 5 }, trainingArrow: { position: 'absolute', right: 20, top: '50%', color: '#82E7F9', fontSize: 31 },
});
