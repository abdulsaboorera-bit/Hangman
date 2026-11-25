import { Platform, Vibration } from 'react-native';
import * as Haptics from 'expo-haptics';

let vibrationEnabled = true;

export function setVibrationEnabled(enabled) {
  vibrationEnabled = !!enabled;
}

function fallbackVibrate(ms = 30) {
  try {
    Vibration.vibrate(ms);
  } catch {
    // no vibrator available
  }
}

async function buzz(promise, fallbackMs) {
  if (!vibrationEnabled) return;
  try {
    await promise;
  } catch {
    if (Platform.OS !== 'web') fallbackVibrate(fallbackMs);
  }
}

export function tapLight() {
  // Light style is only ~12% amplitude on Android and often unfelt — use Medium
  buzz(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 35);
}

export function tapMedium() {
  buzz(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 50);
}

export function success() {
  buzz(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success), [0, 40, 100, 60]);
}

export function error() {
  buzz(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error), [0, 60, 100, 50]);
}

export function warning() {
  buzz(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning), [0, 50, 120, 70]);
}
