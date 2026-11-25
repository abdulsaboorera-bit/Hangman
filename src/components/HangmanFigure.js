import React, { useEffect } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Path, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import useAnimatedValue from '../hooks/useAnimatedValue';

function Part({ visible, children }) {
  const opacity = useAnimatedValue(visible ? 1 : 0);
  const scale = useAnimatedValue(visible ? 1 : 0.4);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(opacity, {
        toValue: visible ? 1 : 0,
        friction: 6,
        tension: 90,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: visible ? 1 : 0.4,
        friction: 4,
        tension: 110,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, opacity, scale]);

  return (
    <AnimatedG style={{ opacity, transform: [{ scale }] }}>
      {children}
    </AnimatedG>
  );
}

const AnimatedG = Animated.createAnimatedComponent(G);

export default function HangmanFigure({ wrongCount = 0 }) {
  const shake = useAnimatedValue(0);
  const glowPulse = useAnimatedValue(0);
  const prevWrong = React.useRef(wrongCount);

  useEffect(() => {
    if (wrongCount > prevWrong.current) {
      Animated.sequence([
        Animated.timing(shake, { toValue: 1, duration: 70, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -1, duration: 70, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0.6, duration: 60, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
      Animated.sequence([
        Animated.timing(glowPulse, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(glowPulse, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]).start();
    }
    prevWrong.current = wrongCount;
  }, [wrongCount, shake, glowPulse]);

  const translateX = shake.interpolate({
    inputRange: [-1, 1],
    outputRange: [-7, 7],
  });
  const glow = glowPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const face = wrongCount >= 6 ? 'sad' : wrongCount >= 4 ? 'worried' : 'happy';
  const dangerColor = wrongCount >= 5 ? '#FF4757' : '#FF6B6B';

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ translateX }] }}>
        <Svg width={210} height={230} viewBox="0 0 210 230">
          <Defs>
            <LinearGradient id="gallows" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#b2bec3" />
              <Stop offset="1" stopColor="#636e72" />
            </LinearGradient>
            <LinearGradient id="body" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#74b9ff" />
              <Stop offset="1" stopColor="#0984e3" />
            </LinearGradient>
            <LinearGradient id="legs" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#a29bfe" />
              <Stop offset="1" stopColor="#6c5ce7" />
            </LinearGradient>
            <LinearGradient id="head" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#ffeaa7" />
              <Stop offset="1" stopColor="#fdcb6e" />
            </LinearGradient>
          </Defs>

          <Line x1="18" y1="210" x2="130" y2="210" stroke="url(#gallows)" strokeWidth="7" strokeLinecap="round" />
          <Line x1="40" y1="210" x2="40" y2="18" stroke="url(#gallows)" strokeWidth="7" strokeLinecap="round" />
          <Line x1="40" y1="18" x2="138" y2="18" stroke="url(#gallows)" strokeWidth="7" strokeLinecap="round" />
          <Line x1="138" y1="18" x2="138" y2="44" stroke="url(#gallows)" strokeWidth="7" strokeLinecap="round" />
          <Line x1="40" y1="48" x2="74" y2="18" stroke="url(#gallows)" strokeWidth="5" strokeLinecap="round" />
          <Circle cx="40" cy="210" r="5" fill="#636e72" />

          <Part visible={wrongCount >= 1}>
            <Circle cx="138" cy="64" r="21" fill="url(#head)" stroke="#e17055" strokeWidth="2.5" />
            {face === 'happy' && (
              <G>
                <Circle cx="131" cy="60" r="2.8" fill="#2d3436" />
                <Circle cx="145" cy="60" r="2.8" fill="#2d3436" />
                <Path d="M132 69 Q138 76 144 69" stroke="#2d3436" strokeWidth="2.2" fill="none" strokeLinecap="round" />
                <Circle cx="127" cy="66" r="3.5" fill="#ff7675" opacity="0.55" />
                <Circle cx="149" cy="66" r="3.5" fill="#ff7675" opacity="0.55" />
              </G>
            )}
            {face === 'worried' && (
              <G>
                <Circle cx="131" cy="60" r="2.8" fill="#2d3436" />
                <Circle cx="145" cy="60" r="2.8" fill="#2d3436" />
                <Path d="M133 72 Q138 68 143 72" stroke="#2d3436" strokeWidth="2.2" fill="none" strokeLinecap="round" />
                <Line x1="127" y1="54" x2="134" y2="57" stroke="#2d3436" strokeWidth="1.8" strokeLinecap="round" />
                <Line x1="149" y1="54" x2="142" y2="57" stroke="#2d3436" strokeWidth="1.8" strokeLinecap="round" />
              </G>
            )}
            {face === 'sad' && (
              <G>
                <Path d="M127 57 L134 62" stroke="#2d3436" strokeWidth="2.4" strokeLinecap="round" />
                <Path d="M149 57 L142 62" stroke="#2d3436" strokeWidth="2.4" strokeLinecap="round" />
                <Path d="M132 74 Q138 68 144 74" stroke="#2d3436" strokeWidth="2.2" fill="none" strokeLinecap="round" />
                <Circle cx="128" cy="68" r="3" fill="#74b9ff" opacity="0.8" />
              </G>
            )}
          </Part>

          <Part visible={wrongCount >= 2}>
            <Line x1="138" y1="85" x2="138" y2="138" stroke="url(#body)" strokeWidth="8" strokeLinecap="round" />
          </Part>

          <Part visible={wrongCount >= 3}>
            <Line x1="138" y1="102" x2="110" y2="128" stroke="url(#body)" strokeWidth="7.5" strokeLinecap="round" />
            <Circle cx="108" cy="130" r="4" fill="#74b9ff" />
          </Part>

          <Part visible={wrongCount >= 4}>
            <Line x1="138" y1="102" x2="166" y2="128" stroke="url(#body)" strokeWidth="7.5" strokeLinecap="round" />
            <Circle cx="168" cy="130" r="4" fill="#74b9ff" />
          </Part>

          <Part visible={wrongCount >= 5}>
            <Line x1="138" y1="138" x2="114" y2="180" stroke="url(#legs)" strokeWidth="7.5" strokeLinecap="round" />
            <Line x1="114" y1="180" x2="104" y2="180" stroke="url(#legs)" strokeWidth="7.5" strokeLinecap="round" />
          </Part>

          <Part visible={wrongCount >= 6}>
            <Line x1="138" y1="138" x2="162" y2="180" stroke="url(#legs)" strokeWidth="7.5" strokeLinecap="round" />
            <Line x1="162" y1="180" x2="172" y2="180" stroke="url(#legs)" strokeWidth="7.5" strokeLinecap="round" />
          </Part>

          <AnimatedG opacity={glow}>
            <Circle cx="138" cy="64" r="28" fill="none" stroke={dangerColor} strokeWidth="3" opacity="0.7" />
          </AnimatedG>
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderRadius: 28,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
});
