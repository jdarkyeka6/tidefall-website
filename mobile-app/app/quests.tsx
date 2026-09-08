import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { completeQuest, emptyProgress, loadProgress, saveProgress, type TidefallProgress } from '../lib/progress';
import { questCompletion, quests, questStepComplete, reconcileAchievements, worldForDate } from '../lib/world';

export default function QuestsScreen() {
  const [progress, setProgress] = useState<TidefallProgress>(emptyProgress);
  const world = worldForDate();

  useFocusEffect(useCallback(() => {
    let active = true;
    loadProgress().then((next) => { if (active) setProgress(next); });
    return () => { active = false; };
  }, []));

  async function claim(slug: string) {
    const quest = quests.find((item) => item.slug === slug);
    if (!quest) return;
    const state = questCompletion(progress, quest);
    if (!state.ready || progress.completedQuests.includes(slug)) return;
    const next = reconcileAchievements(completeQuest(progress, quest.slug, quest.title, quest.reward));
    await saveProgress(next);
    setProgress(next);
  }

  const completed = progress.completedQuests.length;

  return (
    <LinearGradient colors={['#041019', '#081E2A', '#041019']} style={styles.bg}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.back} onPress={() => router.back()}><Text style={styles.backText}>‹</Text></TouchableOpacity>
          <Text style={styles.kicker}>QUEST LOG</Text>
          <Text style={styles.title}>Things the Tide wants done.</Text>
          <Text style={styles.body}>Quests read the same progress as the Academy, Magic and Books. Finish steps anywhere and they update here automatically.</Text>

          <View style={styles.todayCard}>
            <Text style={styles.todayGlyph}>≈</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.todayLabel}>TODAY'S CURRENT</Text>
              <Text style={styles.todayTitle}>{world.title}</Text>
              <Text style={styles.todayBody}>{world.quest ? 'One quest is especially relevant to today’s Tide.' : 'No specific quest has the current today. Pick your own route.'}</Text>
            </View>
          </View>

          <View style={styles.stats}>
            <View style={styles.stat}><Text style={styles.statNumber}>{completed}</Text><Text style={styles.statLabel}>COMPLETED</Text></View>
            <View style={styles.stat}><Text style={styles.statNumber}>{quests.length - completed}</Text><Text style={styles.statLabel}>REMAINING</Text></View>
            <View style={styles.stat}><Text style={styles.statNumber}>{progress.tidePoints}</Text><Text style={styles.statLabel}>TIDE POINTS</Text></View>
          </View>

          <Text style={styles.sectionTitle}>Available quests</Text>
          {quests.map((quest) => {
            const state = questCompletion(progress, quest);
            const done = progress.completedQuests.includes(quest.slug);
            const recommended = world.quest === quest.slug;
            return (
              <View key={quest.slug} style={[styles.questCard, recommended && styles.questRecommended, done && styles.questDone]}>
                <View style={styles.questHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.questLabel}>{recommended ? 'CURRENT · ' : ''}{quest.label}</Text>
                    <Text style={styles.questTitle}>{quest.title}</Text>
                  </View>
                  <View style={styles.rewardPill}><Text style={styles.rewardText}>+{quest.reward}</Text></View>
                </View>
                <Text style={styles.questCopy}>{quest.copy}</Text>
                <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${(state.completed / state.total) * 100}%` }]} /></View>
                <Text style={styles.progressText}>{state.completed} of {state.total} steps complete</Text>

                <View style={styles.steps}>
                  {quest.steps.map((step, index) => {
                    const stepDone = questStepComplete(progress, step.condition);
                    return (
                      <View key={`${quest.slug}:${index}`} style={styles.step}>
                        <View style={[styles.stepDot, stepDone && styles.stepDotDone]}><Text style={[styles.stepMark, stepDone && styles.stepMarkDone]}>{stepDone ? '✓' : index + 1}</Text></View>
                        <Text style={[styles.stepText, stepDone && styles.stepTextDone]}>{step.text}</Text>
                      </View>
                    );
                  })}
                </View>

                {done ? (
                  <View style={styles.completeBanner}><Text style={styles.completeText}>QUEST COMPLETE</Text></View>
                ) : state.ready ? (
                  <TouchableOpacity style={styles.claimButton} activeOpacity={0.86} onPress={() => claim(quest.slug)}>
                    <Text style={styles.claimText}>CLAIM +{quest.reward} TIDE POINTS</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.keepGoing}>Complete the remaining steps anywhere in Tidefall.</Text>
                )}
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
  back: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#081D28', borderWidth: 1, borderColor: '#1C4352', alignItems: 'center', justifyContent: 'center' }, backText: { color: '#fff', fontSize: 34, lineHeight: 37, marginTop: -3 },
  kicker: { color: '#79E2F5', fontSize: 10, fontWeight: '900', letterSpacing: 2.3, marginTop: 24 }, title: { color: '#F5FCFF', fontSize: 34, lineHeight: 40, fontWeight: '900', marginTop: 7 }, body: { color: '#96AFBA', fontSize: 14, lineHeight: 21, marginTop: 8 },
  todayCard: { marginTop: 22, borderRadius: 24, borderWidth: 1, borderColor: '#285D70', backgroundColor: '#0A2936', padding: 17, flexDirection: 'row', alignItems: 'center', gap: 13 }, todayGlyph: { color: '#8BEAFF', fontSize: 34 }, todayLabel: { color: '#76DDF1', fontSize: 8, fontWeight: '900', letterSpacing: 1.6 }, todayTitle: { color: '#F3FBFD', fontSize: 16, fontWeight: '900', marginTop: 4 }, todayBody: { color: '#88A5B0', fontSize: 10, lineHeight: 15, marginTop: 4 },
  stats: { flexDirection: 'row', gap: 9, marginTop: 11 }, stat: { flex: 1, minHeight: 76, borderRadius: 20, borderWidth: 1, borderColor: '#173B49', backgroundColor: '#081D28', alignItems: 'center', justifyContent: 'center', padding: 5 }, statNumber: { color: '#F3FBFD', fontSize: 20, fontWeight: '900' }, statLabel: { color: '#6E8C98', fontSize: 7, fontWeight: '900', letterSpacing: 0.9, marginTop: 4, textAlign: 'center' },
  sectionTitle: { color: '#F5FBFD', fontSize: 21, fontWeight: '900', marginTop: 28, marginBottom: 12 },
  questCard: { borderRadius: 25, borderWidth: 1, borderColor: '#193F4E', backgroundColor: '#081E29', padding: 18, marginBottom: 12 }, questRecommended: { borderColor: '#4A9AAF', backgroundColor: '#0A2733' }, questDone: { borderColor: '#214753', opacity: 0.82 },
  questHeader: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' }, questLabel: { color: '#72DCEF', fontSize: 8, fontWeight: '900', letterSpacing: 1.4 }, questTitle: { color: '#F5FBFD', fontSize: 19, fontWeight: '900', marginTop: 5 }, rewardPill: { borderRadius: 999, backgroundColor: '#123744', paddingHorizontal: 10, paddingVertical: 7 }, rewardText: { color: '#9BEAF8', fontSize: 9, fontWeight: '900' }, questCopy: { color: '#8DA7B2', fontSize: 11, lineHeight: 17, marginTop: 7 },
  progressTrack: { height: 6, borderRadius: 99, backgroundColor: '#153540', overflow: 'hidden', marginTop: 14 }, progressFill: { height: '100%', borderRadius: 99, backgroundColor: '#8BE8F9' }, progressText: { color: '#708D98', fontSize: 9, marginTop: 5 },
  steps: { marginTop: 11, gap: 8 }, step: { minHeight: 45, borderRadius: 15, backgroundColor: '#071923', borderWidth: 1, borderColor: '#153743', paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', gap: 10 }, stepDot: { width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: '#35535F', alignItems: 'center', justifyContent: 'center' }, stepDotDone: { backgroundColor: '#BDF4FD', borderColor: '#BDF4FD' }, stepMark: { color: '#79929C', fontSize: 9, fontWeight: '900' }, stepMarkDone: { color: '#06212C' }, stepText: { flex: 1, color: '#A5BAC2', fontSize: 11, fontWeight: '700' }, stepTextDone: { color: '#DDF6FB' },
  claimButton: { marginTop: 14, borderRadius: 15, backgroundColor: '#C7F6FF', paddingVertical: 13, alignItems: 'center' }, claimText: { color: '#06212C', fontSize: 9, fontWeight: '900', letterSpacing: 1.1 }, completeBanner: { marginTop: 14, borderRadius: 15, borderWidth: 1, borderColor: '#2B6171', backgroundColor: '#0D2B37', paddingVertical: 12, alignItems: 'center' }, completeText: { color: '#89E5F5', fontSize: 9, fontWeight: '900', letterSpacing: 1.4 }, keepGoing: { color: '#667F89', fontSize: 9, fontWeight: '700', marginTop: 13, textAlign: 'center' },
});
