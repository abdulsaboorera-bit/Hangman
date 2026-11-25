import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import AppBackground from './AppBackground';
import PrimaryButton from './PrimaryButton';
import { COLORS, FONT, FONT_SIZES, SPACING, RADIUS } from '../constants/theme';

export default function ScreenPlaceholder({ title, subtitle, onBack, actionLabel, onAction }) {
  return (
    <AppBackground>
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Coming in a later phase</Text>
          </View>
        </View>
        {onAction && (
          <PrimaryButton label={actionLabel} onPress={onAction} style={styles.button} />
        )}
        {onBack && (
          <PrimaryButton
            label="Go Back"
            onPress={onBack}
            colors={['#2f3b5c', '#3d4f7c']}
            style={styles.button}
          />
        )}
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
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    width: '100%',
    maxWidth: 400,
  },
  title: {
    color: COLORS.text,
    fontFamily: FONT.extrabold,
    fontSize: FONT_SIZES.xl,
    textAlign: 'center',
  },
  subtitle: {
    color: COLORS.textDim,
    fontFamily: FONT.semibold,
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 24,
  },
  badge: {
    marginTop: SPACING.md,
    backgroundColor: 'rgba(255, 165, 2, 0.2)',
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  badgeText: {
    color: COLORS.primaryAlt,
    fontFamily: FONT.bold,
    fontSize: FONT_SIZES.xs,
  },
  button: {
    marginTop: SPACING.lg,
    width: '100%',
    maxWidth: 400,
  },
});
