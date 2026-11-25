import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import AppBackground from '../components/AppBackground';
import { COLORS, FONT, FONT_SIZES, SPACING, RADIUS, SHADOW } from '../constants/theme';

const STEPS = [
  {
    icon: '🎯',
    title: 'Pick a category',
    desc: 'Choose from Animals, Countries, Food, Technology, Sports, Movies, Programming or General Knowledge.',
  },
  {
    icon: '🎚️',
    title: 'Choose difficulty',
    desc: 'Easy has short words, Medium has medium words, Hard has long challenging words.',
  },
  {
    icon: '🔤',
    title: 'Guess letters',
    desc: 'Tap letters on the keyboard. Correct letters appear in the word. Wrong letters count as mistakes.',
  },
  {
    icon: '🖼',
    title: 'Watch the hangman',
    desc: 'Each wrong guess draws one more part. Six wrong guesses and the round is over!',
  },
  {
    icon: '💡',
    title: 'Use hints wisely',
    desc: 'You get 2 hints per round. Each hint shows a short clue about the word, reveals a letter, and costs 20 points.',
  },
  {
    icon: '🏆',
    title: 'Win the round',
    desc: 'Reveal the whole word before running out of attempts. No mistakes = +100 perfect bonus!',
  },
];

const SCORING = [
  { label: 'Correct letter', value: '+10' },
  { label: 'Complete the word', value: '+50' },
  { label: 'Perfect win (0 mistakes)', value: '+100' },
  { label: 'Using a hint', value: '−20' },
  { label: 'Winning a round', value: '+coins' },
];

export default function HowToPlayScreen({ navigation }) {
  return (
    <AppBackground>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          hitSlop={8}
        >
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.title}>How to Play</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {STEPS.map((step, i) => (
          <View key={i} style={styles.stepCard}>
            <View style={styles.stepNum}>
              <Text style={styles.stepNumText}>{i + 1}</Text>
            </View>
            <View style={styles.stepBody}>
              <Text style={styles.stepTitle}>
                {step.icon} {step.title}
              </Text>
              <Text style={styles.stepDesc}>{step.desc}</Text>
            </View>
          </View>
        ))}

        <View style={styles.scoreCard}>
          <Text style={styles.scoreTitle}>📊 Scoring</Text>
          {SCORING.map((s, i) => (
            <View key={i} style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>{s.label}</Text>
              <Text
                style={[
                  styles.scoreValue,
                  s.value.startsWith('−') && { color: COLORS.danger },
                  s.value.startsWith('+') && { color: COLORS.success },
                ]}
              >
                {s.value}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.tip}>
          💡 Tip: letters already used are disabled, so you can never tap the same
          letter twice. Good luck, hero!
        </Text>
      </ScrollView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.sm,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  backText: {
    color: COLORS.text,
    fontSize: 22,
    fontFamily: FONT.bold,
  },
  pressed: {
    opacity: 0.75,
  },
  title: {
    color: COLORS.text,
    fontFamily: FONT.extrabold,
    fontSize: FONT_SIZES.lg,
  },
  body: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
    gap: SPACING.md,
  },
  stepCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: SPACING.md,
    ...SHADOW.card,
  },
  stepNum: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 107, 107, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: {
    color: COLORS.primary,
    fontFamily: FONT.extrabold,
    fontSize: FONT_SIZES.md,
  },
  stepBody: {
    flex: 1,
  },
  stepTitle: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: FONT_SIZES.md,
  },
  stepDesc: {
    color: COLORS.textDim,
    fontFamily: FONT.semibold,
    fontSize: FONT_SIZES.sm,
    marginTop: 4,
    lineHeight: 21,
  },
  scoreCard: {
    backgroundColor: 'rgba(255, 165, 2, 0.08)',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 165, 2, 0.25)',
  },
  scoreTitle: {
    color: COLORS.primaryAlt,
    fontFamily: FONT.extrabold,
    fontSize: FONT_SIZES.md,
    marginBottom: SPACING.sm,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  scoreLabel: {
    color: COLORS.textDim,
    fontFamily: FONT.semibold,
    fontSize: FONT_SIZES.sm,
  },
  scoreValue: {
    color: COLORS.text,
    fontFamily: FONT.extrabold,
    fontSize: FONT_SIZES.sm,
  },
  tip: {
    color: COLORS.textDim,
    fontFamily: FONT.semibold,
    fontSize: FONT_SIZES.sm,
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: SPACING.sm,
  },
});
