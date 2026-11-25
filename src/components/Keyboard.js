import React, { useEffect } from 'react';
import { Animated, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONT, FONT_SIZES, RADIUS } from '../constants/theme';
import useAnimatedValue from '../hooks/useAnimatedValue';

const ROWS = [
  ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
  ['J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R'],
  ['S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
];

function Key({ letter, state, onPress, size }) {
  const press = useAnimatedValue(0);
  const reveal = useAnimatedValue(0);
  const isCorrect = state === 'correct';
  const isWrong = state === 'wrong';
  const isUsed = isCorrect || isWrong;

  useEffect(() => {
    if (isUsed) {
      Animated.spring(reveal, {
        toValue: 1,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }).start();
    }
  }, [isUsed, reveal]);

  const scale = Animated.multiply(
    press.interpolate({ inputRange: [0, 1], outputRange: [1, 0.88] }),
    reveal.interpolate({ inputRange: [0, 1], outputRange: [1, 0.95] })
  );

  const body = isCorrect ? (
    <LinearGradient
      colors={['#2ED573', '#17B978']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.key, { width: size, height: size }]}
    >
      <Text style={[styles.keyText, styles.textCorrect]}>{letter}</Text>
    </LinearGradient>
  ) : (
    <View
      style={[
        styles.key,
        { width: size, height: size },
        isWrong && styles.keyWrong,
        !isUsed && styles.keyDefault,
      ]}
    >
      <Text
        style={[
          styles.keyText,
          isWrong && styles.textWrong,
        ]}
      >
        {letter}
      </Text>
    </View>
  );

  return (
    <Pressable
      onPress={() => onPress(letter)}
      disabled={isUsed}
      onPressIn={() =>
        Animated.spring(press, { toValue: 1, useNativeDriver: true, friction: 5, tension: 200 }).start()
      }
      onPressOut={() =>
        Animated.spring(press, { toValue: 0, useNativeDriver: true, friction: 5, tension: 200 }).start()
      }
    >
      <Animated.View style={{ transform: [{ scale }], opacity: isWrong ? 0.55 : 1 }}>
        {body}
      </Animated.View>
    </Pressable>
  );
}

export default function Keyboard({ guessedLetters, correctLetters, wrongLetters, onGuess }) {
  const { width } = useWindowDimensions();
  const horizontalPad = 10;
  const gap = 6;
  const maxRow = 9;
  const available = width - horizontalPad * 2 - gap * (maxRow - 1);
  const keySize = Math.min(42, Math.floor(available / maxRow));

  const getState = (letter) => {
    if (correctLetters.includes(letter)) return 'correct';
    if (wrongLetters.includes(letter)) return 'wrong';
    return 'default';
  };

  return (
    <View style={styles.keyboard}>
      {ROWS.map((row, ri) => (
        <View key={ri} style={styles.row}>
          {row.map((letter) => (
            <Key
              key={letter}
              letter={letter}
              state={getState(letter)}
              size={keySize}
              onPress={onGuess}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  keyboard: {
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
  },
  key: {
    borderRadius: RADIUS.sm + 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  keyDefault: {
    backgroundColor: '#31406a',
  },
  keyWrong: {
    backgroundColor: 'rgba(255, 71, 87, 0.4)',
    borderColor: 'rgba(255, 71, 87, 0.55)',
  },
  keyText: {
    color: COLORS.text,
    fontFamily: FONT.extrabold,
    fontSize: FONT_SIZES.md,
  },
  textCorrect: {
    color: '#0a2e1a',
  },
  textWrong: {
    color: 'rgba(255,255,255,0.75)',
  },
});
