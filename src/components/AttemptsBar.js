import React, { useEffect } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONT, FONT_SIZES, RADIUS } from '../constants/theme';
import useAnimatedValue from '../hooks/useAnimatedValue';

function Dot({ lost, index }) {
  const pop = useAnimatedValue(1);

  useEffect(() => {
    if (lost) {
      Animated.sequence([
        Animated.spring(pop, { toValue: 1.6, friction: 3, tension: 140, useNativeDriver: true }),
        Animated.spring(pop, { toValue: 1, friction: 5, tension: 90, useNativeDriver: true }),
      ]).start();
    }
  }, [lost, pop]);

  return (
    <Animated.View
      style={[
        styles.dot,
        lost ? styles.dotLost : styles.dotLeft,
        { transform: [{ scale: pop }] },
      ]}
    />
  );
}

export default function AttemptsBar({ wrongCount, maxWrong }) {
  const remaining = maxWrong - wrongCount;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Attempts</Text>
      <View style={styles.dots}>
        {Array.from({ length: maxWrong }).map((_, i) => (
          <Dot key={i} lost={i < wrongCount} index={i} />
        ))}
      </View>
      <View
        style={[
          styles.countPill,
          remaining <= 2 && styles.countPillDanger,
          remaining > 2 && styles.countPillOk,
        ]}
      >
        <Text
          style={[
            styles.count,
            remaining <= 2 && { color: '#fff' },
          ]}
        >
          {remaining}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: RADIUS.pill,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  label: {
    color: COLORS.textDim,
    fontFamily: FONT.bold,
    fontSize: FONT_SIZES.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 11,
    height: 11,
    borderRadius: 6,
  },
  dotLeft: {
    backgroundColor: COLORS.success,
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 5,
    elevation: 4,
  },
  dotLost: {
    backgroundColor: 'rgba(255, 71, 87, 0.3)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 71, 87, 0.55)',
  },
  countPill: {
    borderRadius: RADIUS.pill,
    paddingHorizontal: 9,
    paddingVertical: 2,
    minWidth: 28,
    alignItems: 'center',
  },
  countPillOk: {
    backgroundColor: 'rgba(46, 213, 115, 0.22)',
  },
  countPillDanger: {
    backgroundColor: COLORS.danger,
    shadowColor: COLORS.danger,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 5,
  },
  count: {
    color: COLORS.success,
    fontFamily: FONT.extrabold,
    fontSize: FONT_SIZES.sm,
  },
});
