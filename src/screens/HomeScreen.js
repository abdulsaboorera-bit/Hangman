import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import AppBackground from '../components/AppBackground';
import PrimaryButton from '../components/PrimaryButton';
import FloatingBubbles from '../components/FloatingBubbles';
import ScreenFade from '../components/ScreenFade';
import AdBanner from '../components/AdBanner';
import { useApp } from '../hooks/useAppContext';
import { COLORS, FONT, FONT_SIZES, SPACING, RADIUS, GRADIENTS, SHADOW } from '../constants/theme';

const MENU_ITEMS = [
  { key: 'Play', label: '▶  PLAY', route: 'Category', gradient: GRADIENTS.playButton },
  { key: 'HowToPlay', label: '❓  HOW TO PLAY', route: 'HowToPlay', gradient: ['#4a6cf7', '#6a8dff'] },
  { key: 'HighScores', label: '🏆  HIGH SCORES', route: 'HighScores', gradient: ['#FFC312', '#FFA502'] },
  { key: 'Settings', label: '⚙  SETTINGS', route: 'Settings', gradient: ['#2f3b5c', '#3d4f7c'] },
];

export default function HomeScreen({ navigation }) {
  const { stats } = useApp();

  return (
    <AppBackground>
      <FloatingBubbles />
      <ScreenFade>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
        <View style={styles.header}>
          <Text style={styles.title}>HANGMAN</Text>
          <Text style={styles.subtitle}>Letter Quest</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalScore}</Text>
            <Text style={styles.statLabel}>Score</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: COLORS.coin }]}>
              {stats.totalCoins}
            </Text>
            <Text style={styles.statLabel}>Coins</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: COLORS.success }]}>
              {stats.highScore}
            </Text>
            <Text style={styles.statLabel}>Best</Text>
          </View>
        </View>

        <View style={styles.menu}>
          {MENU_ITEMS.map((item) => (
            <PrimaryButton
              key={item.key}
              label={item.label}
              colors={item.gradient}
              onPress={() => navigation.navigate(item.route)}
              style={styles.menuButton}
            />
          ))}
        </View>

        <Text style={styles.version}>v1.0.0</Text>
        <AdBanner />
        </ScrollView>
      </ScreenFade>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    paddingTop: SPACING.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    color: COLORS.primary,
    fontFamily: FONT.extrabold,
    fontSize: FONT_SIZES.xxl,
    letterSpacing: 3,
    textShadowColor: 'rgba(255, 107, 107, 0.45)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 12,
  },
  subtitle: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: FONT_SIZES.lg,
    letterSpacing: 6,
    marginTop: SPACING.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  statCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    minWidth: 96,
    ...SHADOW.card,
  },
  statValue: {
    color: COLORS.text,
    fontFamily: FONT.extrabold,
    fontSize: FONT_SIZES.lg,
  },
  statLabel: {
    color: COLORS.textDim,
    fontFamily: FONT.semibold,
    fontSize: FONT_SIZES.xs,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  menu: {
    width: '100%',
    maxWidth: 400,
    gap: SPACING.md,
  },
  menuButton: {
    width: '100%',
  },
  version: {
    color: COLORS.textFaint,
    fontFamily: FONT.semibold,
    fontSize: FONT_SIZES.xs,
    marginTop: SPACING.xl,
  },
});
