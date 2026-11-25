import React, { useEffect } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONT, FONT_SIZES, RADIUS } from '../constants/theme';
import useAnimatedValue from '../hooks/useAnimatedValue';

function LetterSlot({ char, revealed, size }) {
  const scale = useAnimatedValue(revealed ? 1 : 0);
  const glow = useAnimatedValue(0);

  useEffect(() => {
    if (revealed) {
      Animated.sequence([
        Animated.spring(scale, { toValue: 1.35, friction: 3, tension: 130, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }),
      ]).start();
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0, duration: 420, useNativeDriver: true }),
      ]).start();
    }
  }, [revealed, scale, glow]);

  const isSpecial = char === ' ' || char === '-';
  if (isSpecial) return <View style={[styles.specialGap, { width: Math.max(8, size * 0.35) }]} />;

  const borderColor = glow.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(46,213,115,0.9)', '#fff'],
  });

  return (
    <Animated.View
      style={[
        styles.slot,
        revealed && styles.slotRevealed,
        {
          width: size,
          height: size * 1.32,
          transform: [{ scale }],
          borderBottomColor: revealed ? borderColor : 'rgba(255,255,255,0.35)',
        },
      ]}
    >
      <Text
        style={[
          styles.letter,
          revealed && styles.letterRevealed,
          { fontSize: Math.max(16, size * 0.58) },
        ]}
      >
        {revealed ? char : ''}
      </Text>
    </Animated.View>
  );
}

export default function WordDisplay({ word, guessedLetters }) {
  const chars = word.split('');
  const letterCount = chars.filter((c) => c !== ' ' && c !== '-').length;
  let slotSize = 40;
  if (letterCount > 13) slotSize = 24;
  else if (letterCount > 11) slotSize = 28;
  else if (letterCount > 9) slotSize = 33;
  else if (letterCount > 7) slotSize = 37;

  return (
    <View style={styles.row}>
      {chars.map((ch, i) => (
        <LetterSlot
          key={`${ch}-${i}`}
          char={ch}
          size={slotSize}
          revealed={guessedLetters.includes(ch) || ch === ' ' || ch === '-'}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 7,
    paddingHorizontal: 6,
  },
  slot: {
    borderBottomWidth: 3.5,
    borderBottomColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 5,
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderRadius: RADIUS.sm,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  slotRevealed: {
    backgroundColor: 'rgba(46, 213, 115, 0.14)',
    borderColor: 'rgba(46, 213, 115, 0.25)',
  },
  letter: {
    color: COLORS.text,
    fontFamily: FONT.extrabold,
    fontSize: FONT_SIZES.xl,
  },
  letterRevealed: {
    color: COLORS.success,
    textShadowColor: 'rgba(46,213,115,0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  specialGap: {
    width: 14,
  },
});
