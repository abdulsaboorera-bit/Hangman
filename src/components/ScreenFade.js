import useAnimatedValue from '../hooks/useAnimatedValue';
import React, { useEffect } from 'react';
import { Animated, StyleSheet } from 'react-native';

export default function ScreenFade({ children, style }) {
  const opacity = useAnimatedValue(0);
  const translateY = useAnimatedValue(16);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY]);

  return (
    <Animated.View
      style={[styles.flex, style, { opacity, transform: [{ translateY }] }]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
