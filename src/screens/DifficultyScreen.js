import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import AppBackground from '../components/AppBackground';
import { playSound } from '../services/soundService';
import { tapLight } from '../services/hapticsService';
import { CATEGORIES, DIFFICULTIES } from '../data/words';
import { COLORS, FONT, FONT_SIZES, SPACING, RADIUS, SHADOW } from '../constants/theme';

export default function DifficultyScreen({ navigation, route }) {
  const category = route.params?.category || 'animals';
  const categoryMeta = CATEGORIES.find((c) => c.id === category);

  return (
    <AppBackground>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          hitSlop={8}
        >
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>Difficulty</Text>
          <Text style={styles.subtitle}>
            {categoryMeta?.icon} {categoryMeta?.name}
          </Text>
        </View>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {DIFFICULTIES.map((diff) => (
          <Pressable
            key={diff.id}
            onPress={() => {
              playSound('click');
              tapLight();
              navigation.navigate('Game', { category, difficulty: diff.id });
            }}
            style={({ pressed }) => [
              styles.card,
              { borderColor: diff.color + '66' },
              pressed && styles.pressed,
            ]}
          >
            <View style={[styles.iconCircle, { backgroundColor: diff.color + '2a' }]}>
              <Text style={styles.icon}>{diff.icon}</Text>
            </View>
            <View style={styles.cardBody}>
              <Text style={[styles.cardTitle, { color: diff.color }]}>{diff.name}</Text>
              <Text style={styles.cardDesc}>{diff.description}</Text>
            </View>
            <Text style={[styles.arrow, { color: diff.color }]}>›</Text>
            <View style={[styles.accent, { backgroundColor: diff.color }]} />
          </Pressable>
        ))}
      </ScrollView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.sm,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  backText: {
    color: COLORS.text,
    fontSize: 22,
    fontFamily: FONT.bold,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  titleWrap: {
    alignItems: 'center',
  },
  title: {
    color: COLORS.text,
    fontFamily: FONT.extrabold,
    fontSize: FONT_SIZES.lg,
  },
  subtitle: {
    color: COLORS.textDim,
    fontFamily: FONT.semibold,
    fontSize: FONT_SIZES.xs,
  },
  list: {
    padding: SPACING.lg,
    gap: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1.5,
    overflow: 'hidden',
    ...SHADOW.card,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  icon: {
    fontSize: 28,
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: FONT.extrabold,
    fontSize: FONT_SIZES.lg,
  },
  cardDesc: {
    color: COLORS.textDim,
    fontFamily: FONT.semibold,
    fontSize: FONT_SIZES.sm,
    marginTop: 2,
  },
  arrow: {
    fontSize: 32,
    fontFamily: FONT.bold,
    marginRight: 4,
  },
  accent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
  },
});
