import React from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import AppBackground from '../components/AppBackground';
import PrimaryButton from '../components/PrimaryButton';
import { useApp } from '../hooks/useAppContext';
import { COLORS, FONT, FONT_SIZES, SPACING, RADIUS, SHADOW } from '../constants/theme';

const PRIVACY_POLICY_URL = 'https://example.com/hangman-letter-quest/privacy';

function SettingRow({ icon, label, description, value, onValueChange }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowIcon}>{icon}</Text>
      <View style={styles.rowBody}>
        <Text style={styles.rowLabel}>{label}</Text>
        {description ? <Text style={styles.rowDesc}>{description}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#2f3b5c', true: COLORS.success }}
        thumbColor="#fff"
      />
    </View>
  );
}

export default function SettingsScreen({ navigation }) {
  const { settings, updateSettings, resetProgress } = useApp();
  const sound = settings.sound;
  const vibration = settings.vibration;
  const music = settings.music;

  const setSound = (v) => updateSettings({ sound: v });
  const setVibration = (v) => updateSettings({ vibration: v });
  const setMusic = (v) => updateSettings({ music: v });

  const onBack = () => {
    navigation.goBack();
  };

  const confirmReset = () => {
    Alert.alert(
      'Reset Progress?',
      'This will erase your high score, coins and all statistics. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetProgress();
          },
        },
      ]
    );
  };

  const openPrivacy = () => {
    Linking.openURL(PRIVACY_POLICY_URL).catch(() =>
      Alert.alert('Error', 'Could not open the privacy policy link.')
    );
  };

  return (
    <AppBackground>
      <View style={styles.header}>
        <Pressable
          onPress={onBack}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          hitSlop={8}
        >
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FEEDBACK</Text>
          <View style={styles.card}>
            <SettingRow
              icon="🔊"
              label="Sound Effects"
              description="Button clicks, correct & wrong guesses"
              value={sound}
              onValueChange={setSound}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="📳"
              label="Vibration"
              description="Haptic feedback on taps"
              value={vibration}
              onValueChange={setVibration}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="🎵"
              label="Background Music"
              description="Ambient menu & gameplay music"
              value={music}
              onValueChange={setMusic}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DATA</Text>
          <View style={styles.card}>
            <Pressable
              onPress={confirmReset}
              style={({ pressed }) => [styles.actionRow, pressed && styles.pressed]}
            >
              <Text style={styles.rowIcon}>🗑</Text>
              <View style={styles.rowBody}>
                <Text style={[styles.rowLabel, { color: COLORS.danger }]}>
                  Reset Progress
                </Text>
                <Text style={styles.rowDesc}>
                  Erase high score, coins and statistics
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
            <View style={styles.divider} />
            <Pressable
              onPress={openPrivacy}
              style={({ pressed }) => [styles.actionRow, pressed && styles.pressed]}
            >
              <Text style={styles.rowIcon}>🔒</Text>
              <View style={styles.rowBody}>
                <Text style={styles.rowLabel}>Privacy Policy</Text>
                <Text style={styles.rowDesc}>How we handle your data</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.version}>Hangman: Letter Quest · v1.0.0</Text>

        <PrimaryButton
          label="←  Back to Home"
          colors={['#2f3b5c', '#3d4f7c']}
          onPress={onBack}
          style={styles.backHome}
        />
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
    opacity: 0.75,
  },
  title: {
    color: COLORS.text,
    fontFamily: FONT.extrabold,
    fontSize: FONT_SIZES.lg,
  },
  body: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    color: COLORS.textFaint,
    fontFamily: FONT.bold,
    fontSize: FONT_SIZES.xs,
    letterSpacing: 2,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.xs,
  },
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    ...SHADOW.card,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  rowIcon: {
    fontSize: 22,
    width: 32,
    textAlign: 'center',
  },
  rowBody: {
    flex: 1,
  },
  rowLabel: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: FONT_SIZES.md,
  },
  rowDesc: {
    color: COLORS.textDim,
    fontFamily: FONT.semibold,
    fontSize: FONT_SIZES.xs,
    marginTop: 2,
  },
  chevron: {
    color: COLORS.textFaint,
    fontSize: 26,
    fontFamily: FONT.bold,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginLeft: 52,
  },
  version: {
    color: COLORS.textFaint,
    fontFamily: FONT.semibold,
    fontSize: FONT_SIZES.xs,
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  backHome: {
    width: '100%',
  },
});
