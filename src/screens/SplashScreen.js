import useAnimatedValue from '../hooks/useAnimatedValue';
import React, { useEffect } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import AppBackground from '../components/AppBackground';
import FloatingBubbles from '../components/FloatingBubbles';
import { COLORS, FONT, FONT_SIZES, SPACING } from '../constants/theme';

export default function SplashScreen({ navigation }) {
  const fade = useAnimatedValue(0);
  const bounce = useAnimatedValue(0);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(bounce, {
        toValue: 1,
        friction: 4,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      navigation.replace('Home');
    }, 2200);

    return () => clearTimeout(timer);
  }, [navigation, fade, bounce]);

  return (
    <AppBackground>
      <FloatingBubbles />
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.logoWrap,
            { opacity: fade, transform: [{ scale: bounce }] },
          ]}
        >
          <Text style={styles.hangman}>HANGMAN</Text>
          <Text style={styles.quest}>Letter Quest</Text>
          <View style={styles.divider} />
          <Text style={styles.tagline}>Guess the word. Save the friend!</Text>
        </Animated.View>
        <Animated.Text style={[styles.loading, { opacity: fade }]}>
          Loading...
        </Animated.Text>
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
  logoWrap: {
    alignItems: 'center',
  },
  hangman: {
    color: COLORS.primary,
    fontFamily: FONT.extrabold,
    fontSize: FONT_SIZES.huge,
    letterSpacing: 4,
    textShadowColor: 'rgba(255, 107, 107, 0.5)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 16,
  },
  quest: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: FONT_SIZES.xl,
    letterSpacing: 8,
    marginTop: SPACING.xs,
  },
  divider: {
    width: 120,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.primaryAlt,
    marginTop: SPACING.md,
  },
  tagline: {
    color: COLORS.textDim,
    fontFamily: FONT.semibold,
    fontSize: FONT_SIZES.md,
    marginTop: SPACING.md,
    fontStyle: 'italic',
  },
  loading: {
    position: 'absolute',
    bottom: SPACING.xxl,
    color: COLORS.textFaint,
    fontFamily: FONT.semibold,
    fontSize: FONT_SIZES.sm,
    letterSpacing: 2,
  },
});
