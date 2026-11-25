import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import AppBackground from '../components/AppBackground';
import { useApp } from '../hooks/useAppContext';
import { COLORS, FONT, FONT_SIZES, SPACING, RADIUS, SHADOW } from '../constants/theme';

function StatCard({ icon, label, value, color = COLORS.text, wide = false }) {
  return (
    <View style={[styles.statCard, wide && styles.statWide]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function HighScoresScreen({ navigation }) {
  const { stats } = useApp();
  const winRate =
    stats.gamesPlayed > 0
      ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
      : 0;

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
        <Text style={styles.title}>High Scores</Text>
        <View style={styles.scorePill}>
          <Text style={styles.scorePillLabel}>SCORE</Text>
          <Text style={styles.scorePillValue}>{stats.highScore}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Text style={styles.heroIcon}>👑</Text>
          <Text style={styles.heroValue}>{stats.highScore}</Text>
          <Text style={styles.heroLabel}>Highest Score</Text>
        </View>

        <View style={styles.grid}>
          <StatCard icon="⭐" label="Total Score" value={stats.totalScore} color={COLORS.primaryAlt} />
          <StatCard icon="🪙" label="Coins" value={stats.totalCoins} color={COLORS.coin} />
          <StatCard icon="🎮" label="Games Played" value={stats.gamesPlayed} />
          <StatCard icon="✅" label="Games Won" value={stats.gamesWon} color={COLORS.success} />
          <StatCard icon="❌" label="Games Lost" value={stats.gamesLost} color={COLORS.danger} />
          <StatCard icon="📈" label="Win Rate" value={`${winRate}%`} color="#4A6CF7" />
        </View>

        {stats.gamesPlayed === 0 && (
          <Text style={styles.empty}>
            No games played yet. Play a round to set your first high score! 🚀
          </Text>
        )}
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
  scorePill: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 14,
    paddingVertical: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 217, 61, 0.4)',
    minWidth: 74,
    ...SHADOW.card,
  },
  scorePillLabel: {
    color: COLORS.textFaint,
    fontFamily: FONT.bold,
    fontSize: 9,
    letterSpacing: 1,
  },
  scorePillValue: {
    color: COLORS.coin,
    fontFamily: FONT.extrabold,
    fontSize: FONT_SIZES.md,
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
  },
  heroCard: {
    backgroundColor: COLORS.bgCardSolid,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 217, 61, 0.4)',
    marginBottom: SPACING.lg,
    ...SHADOW.card,
  },
  heroIcon: {
    fontSize: 48,
  },
  heroValue: {
    color: COLORS.coin,
    fontFamily: FONT.extrabold,
    fontSize: FONT_SIZES.huge,
    marginTop: SPACING.xs,
  },
  heroLabel: {
    color: COLORS.textDim,
    fontFamily: FONT.bold,
    fontSize: FONT_SIZES.sm,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    justifyContent: 'center',
  },
  statCard: {
    width: '46%',
    maxWidth: 180,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    ...SHADOW.card,
  },
  statWide: {
    width: '100%',
  },
  statIcon: {
    fontSize: 26,
  },
  statValue: {
    fontFamily: FONT.extrabold,
    fontSize: FONT_SIZES.xl,
    marginTop: 6,
  },
  statLabel: {
    color: COLORS.textDim,
    fontFamily: FONT.semibold,
    fontSize: FONT_SIZES.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
  },
  empty: {
    color: COLORS.textDim,
    fontFamily: FONT.semibold,
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
    marginTop: SPACING.lg,
    lineHeight: 22,
  },
});
