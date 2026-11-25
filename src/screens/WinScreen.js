import useAnimatedValue from '../hooks/useAnimatedValue';
import React, { useEffect } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import AppBackground from '../components/AppBackground';
import PrimaryButton from '../components/PrimaryButton';
import { useApp } from '../hooks/useAppContext';
import { useFeedback } from '../services/useFeedback';
import * as HapticsSvc from '../services/hapticsService';
import { showInterstitialIfDue } from '../services/ads';
import { COLORS, FONT, FONT_SIZES, SPACING, RADIUS, GRADIENTS, SHADOW } from '../constants/theme';
import { SCORE_WORD_COMPLETE, SCORE_PERFECT_WIN, HINT_COST } from '../utils/gameLogic';

function confettiPiece(i) {
  const colors = ['#FF6B6B', '#FFA502', '#2ED573', '#4A6CF7', '#FFD93D', '#A55EEA'];
  return {
    key: i,
    color: colors[i % colors.length],
    left: (i * 37) % 100,
    delay: (i % 10) * 0.12,
    size: 6 + (i % 4) * 3,
  };
}

const PIECES = Array.from({ length: 28 }, (_, i) => confettiPiece(i));

function ConfettiPiece({ piece }) {
  const fall = useAnimatedValue(0);
  const rotate = useAnimatedValue(0);

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.timing(fall, {
          toValue: 1,
          duration: 2800 + piece.delay * 1000,
          delay: piece.delay * 1000,
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: 1,
          duration: 1800,
          delay: piece.delay * 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fall, rotate, piece.delay]);

  const translateY = fall.interpolate({
    inputRange: [0, 1],
    outputRange: [-40, 420],
  });
  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '720deg'],
  });

  return (
    <Animated.View
      style={[
        styles.piece,
        {
          left: `${piece.left}%`,
          width: piece.size,
          height: piece.size * 1.6,
          backgroundColor: piece.color,
          transform: [{ translateY }, { rotate: spin }],
        },
      ]}
    />
  );
}

export default function WinScreen({ navigation, route }) {
  const { recordGameResult } = useApp();
  const { play } = useFeedback();
  const score = route.params?.score ?? 0;
  const word = route.params?.word ?? '';
  const wrongCount = route.params?.wrongCount ?? 0;
  const hintsUsed = route.params?.hintsUsed ?? 0;
  const category = route.params?.category || 'animals';
  const difficulty = route.params?.difficulty || 'easy';
  const recordedRef = React.useRef(false);

  const perfect = wrongCount === 0;
  const coins = Math.max(5, 10 + (perfect ? 15 : 0) - hintsUsed * 5);

  useEffect(() => {
    if (recordedRef.current) return;
    recordedRef.current = true;
    recordGameResult({ won: true, score, coins });
    setTimeout(() => {
      play('coin');
      HapticsSvc.success();
      showInterstitialIfDue();
    }, 700);
  }, [recordGameResult, score, coins, play]);

  const pop = useAnimatedValue(0);
  useEffect(() => {
    Animated.spring(pop, {
      toValue: 1,
      friction: 4,
      tension: 70,
      useNativeDriver: true,
    }).start();
  }, [pop]);

  return (
    <AppBackground>
      <View style={styles.confettiLayer} pointerEvents="none">
        {PIECES.map((p) => (
          <ConfettiPiece key={p.key} piece={p} />
        ))}
      </View>

      <View style={styles.container}>
        <Animated.View
          style={[styles.card, { transform: [{ scale: pop }], opacity: pop }]}
        >
          <Text style={styles.trophy}>🏆</Text>
          <Text style={styles.title}>You Win!</Text>
          <Text style={styles.wordLabel}>The word was</Text>
          <Text style={styles.word}>{word}</Text>

          {perfect && (
            <View style={styles.perfectBadge}>
              <Text style={styles.perfectText}>✨ PERFECT! ✨</Text>
            </View>
          )}

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>+{score}</Text>
              <Text style={styles.statLabel}>Points</Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: COLORS.coin }]}>+{coins}</Text>
              <Text style={styles.statLabel}>Coins</Text>
            </View>
          </View>

          <View style={styles.breakdown}>
            <Text style={styles.breakdownRow}>Word complete +{SCORE_WORD_COMPLETE}</Text>
            {perfect && <Text style={styles.breakdownRow}>Perfect win +{SCORE_PERFECT_WIN}</Text>}
            {hintsUsed > 0 && (
              <Text style={[styles.breakdownRow, { color: COLORS.danger }]}>
                Hints used −{hintsUsed * HINT_COST}
              </Text>
            )}
          </View>

          <PrimaryButton
            label="▶  NEXT LEVEL"
            colors={GRADIENTS.success}
            onPress={() =>
              navigation.replace('Game', { category, difficulty })
            }
            style={styles.btn}
          />
          <PrimaryButton
            label="🔄  PLAY AGAIN"
            onPress={() => navigation.replace('Game', { category, difficulty })}
            style={styles.btn}
          />
          <PrimaryButton
            label="🏠  HOME"
            colors={['#2f3b5c', '#3d4f7c']}
            onPress={() => navigation.navigate('Home')}
            style={styles.btn}
          />
        </Animated.View>
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  confettiLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  piece: {
    position: 'absolute',
    top: 0,
    borderRadius: 2,
    opacity: 0.9,
  },
  card: {
    backgroundColor: COLORS.bgCardSolid,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    ...SHADOW.card,
  },
  trophy: {
    fontSize: 64,
  },
  title: {
    color: COLORS.success,
    fontFamily: FONT.extrabold,
    fontSize: FONT_SIZES.xxl,
    marginTop: SPACING.xs,
  },
  wordLabel: {
    color: COLORS.textDim,
    fontFamily: FONT.semibold,
    fontSize: FONT_SIZES.sm,
    marginTop: SPACING.md,
  },
  word: {
    color: COLORS.text,
    fontFamily: FONT.extrabold,
    fontSize: FONT_SIZES.xl,
    letterSpacing: 4,
    marginTop: 4,
  },
  perfectBadge: {
    marginTop: SPACING.sm,
    backgroundColor: 'rgba(46, 213, 115, 0.18)',
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
  },
  perfectText: {
    color: COLORS.success,
    fontFamily: FONT.extrabold,
    fontSize: FONT_SIZES.sm,
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  stat: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
    minWidth: 110,
  },
  statValue: {
    color: COLORS.success,
    fontFamily: FONT.extrabold,
    fontSize: FONT_SIZES.xl,
  },
  statLabel: {
    color: COLORS.textDim,
    fontFamily: FONT.semibold,
    fontSize: FONT_SIZES.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
  },
  breakdown: {
    marginBottom: SPACING.md,
    alignItems: 'center',
    gap: 4,
  },
  breakdownRow: {
    color: COLORS.textDim,
    fontFamily: FONT.semibold,
    fontSize: FONT_SIZES.xs,
  },
  btn: {
    width: '100%',
    marginBottom: SPACING.sm,
  },
});
