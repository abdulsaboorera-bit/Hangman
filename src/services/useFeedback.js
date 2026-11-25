import { useEffect, useRef } from 'react';
import { useApp } from '../hooks/useAppContext';
import {
  playSound,
  preloadSounds,
  setMusicEnabled,
  setSoundEnabled,
  startMusic,
  stopMusic,
} from './soundService';
import { setVibrationEnabled } from './hapticsService';

export function useFeedback() {
  const { settings } = useApp();
  const settingsRef = useRef(settings);

  useEffect(() => {
    settingsRef.current = settings;
    setSoundEnabled(settings.sound);
    setVibrationEnabled(settings.vibration);
    setMusicEnabled(settings.music);
    if (settings.music) startMusic();
    else stopMusic();
  }, [settings]);

  useEffect(() => {
    preloadSounds();
  }, []);

  const play = (name) => {
    if (!settingsRef.current.sound) return;
    playSound(name);
  };

  return { play, settings };
}
