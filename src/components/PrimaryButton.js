import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { playSound } from '../services/soundService';
import { tapLight } from '../services/hapticsService';
import { COLORS, GRADIENTS, RADIUS, FONT, FONT_SIZES, SPACING, SHADOW } from '../constants/theme';

export default function PrimaryButton({
  label,
  onPress,
  colors = GRADIENTS.button,
  textStyle,
  style,
  disabled = false,
  silent = false,
  icon,
}) {
  return (
    <Pressable
      onPress={() => {
        if (!disabled) {
          if (!silent) {
            playSound('click');
            tapLight();
          }
          onPress?.();
        }
      }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.wrapper,
        style,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.inner}>
          {icon ? <Text style={styles.icon}>{icon}</Text> : null}
          <Text style={[styles.label, textStyle]}>{label}</Text>
        </View>
        <View style={styles.shine} pointerEvents="none" />
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: RADIUS.pill,
    overflow: 'hidden',
    ...SHADOW.button,
  },
  gradient: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    overflow: 'hidden',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    fontSize: 18,
  },
  label: {
    color: COLORS.text,
    fontFamily: FONT.extrabold,
    fontSize: FONT_SIZES.lg,
    letterSpacing: 0.6,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  shine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '48%',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderTopLeftRadius: RADIUS.pill,
    borderTopRightRadius: RADIUS.pill,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.975 }],
  },
  disabled: {
    opacity: 0.45,
  },
});
