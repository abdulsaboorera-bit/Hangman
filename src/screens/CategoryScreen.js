import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import AppBackground from '../components/AppBackground';
import ScreenFade from '../components/ScreenFade';
import { playSound } from '../services/soundService';
import { tapLight } from '../services/hapticsService';
import { CATEGORIES, WORDS } from '../data/words';
import { COLORS, FONT, FONT_SIZES, SPACING, RADIUS, SHADOW } from '../constants/theme';

export default function CategoryScreen({ navigation }) {
  return (
    <AppBackground>
      <ScreenFade>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          hitSlop={8}
        >
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.title}>Choose Category</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      >
        {CATEGORIES.map((cat, i) => {
          const count =
            (WORDS[cat.id]?.easy?.length || 0) +
            (WORDS[cat.id]?.medium?.length || 0) +
            (WORDS[cat.id]?.hard?.length || 0);
          return (
            <Pressable
              key={cat.id}
              onPress={() => {
                playSound('click');
                tapLight();
                navigation.navigate('Difficulty', { category: cat.id });
              }}
              style={({ pressed }) => [
                styles.card,
                { borderColor: cat.color + '55' },
                pressed && styles.pressed,
              ]}
            >
              <View style={[styles.iconCircle, { backgroundColor: cat.color + '2a' }]}>
                <Text style={styles.icon}>{cat.icon}</Text>
              </View>
              <Text style={styles.cardTitle}>{cat.name}</Text>
              <Text style={styles.cardCount}>{count} words</Text>
              <View style={[styles.accent, { backgroundColor: cat.color }]} />
            </Pressable>
          );
        })}
      </ScrollView>
      </ScreenFade>
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
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  title: {
    color: COLORS.text,
    fontFamily: FONT.extrabold,
    fontSize: FONT_SIZES.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.md,
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  card: {
    width: '46%',
    maxWidth: 200,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
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
    marginBottom: SPACING.sm,
  },
  icon: {
    fontSize: 28,
  },
  cardTitle: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
  },
  cardCount: {
    color: COLORS.textFaint,
    fontFamily: FONT.semibold,
    fontSize: FONT_SIZES.xs,
    marginTop: 4,
  },
  accent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
  },
});
