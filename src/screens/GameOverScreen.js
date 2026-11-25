import useAnimatedValue from '../hooks/useAnimatedValue';
import React, { useEffect } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import AppBackground from '../components/AppBackground';
import PrimaryButton from '../components/PrimaryButton';
import { useApp } from '../hooks/useAppContext';
import { useFeedback } from '../services/useFeedback';
import { showInterstitialIfDue } from '../services/ads';
import { COLORS, FONT, FONT_SIZES, SPACING, RADIUS, GRADIENTS, SHADOW } from '../constants/theme';

export default function GameOverScreen({ navigation, route }) {
  const { recordGameResult } = useApp();
  const { play } = useFeedback();
  const score = route.params?.score ?? 0;
  const word = route.params?.word ?? '';
  const category = route.params?.category || 'animals';
  const difficulty = route.params?.difficulty || 'easy';
  const recordedRef = React.useRef(false);

  useEffect(() => {
    if (recordedRef.current) return;
    recordedRef.current = true;
    recordGameResult({ won: false, score, coins: 0 });
    play('lose');
    setTimeout(() => showInterstitialIfDue(), 400);
  }, [recordGameResult, score, play]);

  const shake = useAnimatedValue(0);
  useEffect(() => {
    Animated.sequence([
      Animated.timing(shake, { toValue: 1, duration: 90, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -1, duration: 90, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0.5, duration: 80, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
  }, [shake]);

  const translateX = shake.interpolate({
    inputRange: [-1, 1],
    outputRange: [-8, 8],
  });

  return (
    <AppBackground>
      <View style={styles.container}>
        <Animated.View
          style={[styles.card, { transform: [{ translateX }] }]}
        >
          <Text style={styles.skull}>😵</Text>
          <Text style={styles.title}>Game Over</Text>
          <Text style={styles.subtitle}>Better luck next time, hero!</Text>

          <View style={styles.answerBox}>
            <Text style={styles.answerLabel}>The word was</Text>
            <Text style={styles.answerWord}>{word}</Text>
          </View>

          <View style={styles.scoreBox}>
            <Text style={styles.scoreValue}>{score}</Text>
            <Text style={styles.scoreLabel}>Final Score</Text>
          </View>

          <PrimaryButton
            label="🔄  RETRY"
            colors={GRADIENTS.danger}
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
  skull: {
    fontSize: 64,
  },
  title: {
    color: COLORS.danger,
    fontFamily: FONT.extrabold,
    fontSize: FONT_SIZES.xxl,
    marginTop: SPACING.xs,
  },
  subtitle: {
    color: COLORS.textDim,
    fontFamily: FONT.semibold,
    fontSize: FONT_SIZES.sm,
    marginTop: SPACING.xs,
  },
  answerBox: {
    backgroundColor: 'rgba(255, 71, 87, 0.12)',
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
    marginTop: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 71, 87, 0.3)',
    width: '100%',
  },
  answerLabel: {
    color: COLORS.textDim,
    fontFamily: FONT.semibold,
    fontSize: FONT_SIZES.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  answerWord: {
    color: COLORS.text,
    fontFamily: FONT.extrabold,
    fontSize: FONT_SIZES.xl,
    letterSpacing: 3,
    marginTop: 4,
  },
  scoreBox: {
    marginVertical: SPACING.lg,
    alignItems: 'center',
  },
  scoreValue: {
    color: COLORS.primaryAlt,
    fontFamily: FONT.extrabold,
    fontSize: FONT_SIZES.huge,
  },
  scoreLabel: {
    color: COLORS.textDim,
    fontFamily: FONT.bold,
    fontSize: FONT_SIZES.xs,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  btn: {
    width: '100%',
    marginBottom: SPACING.sm,
  },
});
