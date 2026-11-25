import useAnimatedValue from '../hooks/useAnimatedValue';
import React, { useEffect } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';

const { width, height } = Dimensions.get('window');

const BUBBLES = Array.from({ length: 7 }, (_, i) => ({
  id: i,
  size: 30 + ((i * 47) % 70),
  startX: ((i * 173) % 100) / 100,
  delay: i * 0.7,
  duration: 12 + (i % 4) * 3,
  opacity: 0.04 + (i % 3) * 0.02,
}));

function Bubble({ spec }) {
  const float = useAnimatedValue(0);

  useEffect(() => {
    Animated.loop(
      Animated.timing(float, {
        toValue: 1,
        duration: spec.duration * 1000,
        delay: spec.delay * 1000,
        useNativeDriver: true,
      })
    ).start();
  }, [float, spec]);

  const translateY = float.interpolate({
    inputRange: [0, 1],
    outputRange: [height + 40, -120],
  });

  return (
    <Animated.View
      style={[
        styles.bubble,
        {
          width: spec.size,
          height: spec.size,
          borderRadius: spec.size / 2,
          left: spec.startX * width,
          opacity: spec.opacity,
          transform: [{ translateY }],
        },
      ]}
    />
  );
}

export default function FloatingBubbles() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {BUBBLES.map((b) => (
        <Bubble key={b.id} spec={b} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    position: 'absolute',
    bottom: -100,
    backgroundColor: '#FF6B6B',
  },
});
