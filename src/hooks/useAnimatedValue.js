import { useState } from 'react';
import { Animated } from 'react-native';

export default function useAnimatedValue(initialValue) {
  const [value] = useState(() => new Animated.Value(initialValue));
  return value;
}
