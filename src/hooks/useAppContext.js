import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_SETTINGS,
  DEFAULT_STATS,
  loadSettings,
  loadStats,
  resetAllProgress,
  saveSettings,
  saveStats,
} from '../services/storage';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [stats, setStats] = useState({ ...DEFAULT_STATS });
  const [settings, setSettings] = useState({ ...DEFAULT_SETTINGS });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [s, st] = await Promise.all([loadStats(), loadSettings()]);
      if (mounted) {
        setStats(s);
        setSettings(st);
        setReady(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const updateSettings = useCallback((patch) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  }, []);

  const recordGameResult = useCallback(
    ({ won, score, coins }) => {
      setStats((prev) => {
        const next = {
          highScore: Math.max(prev.highScore, score || 0),
          totalScore: prev.totalScore + (score || 0),
          gamesPlayed: prev.gamesPlayed + 1,
          gamesWon: prev.gamesWon + (won ? 1 : 0),
          gamesLost: prev.gamesLost + (won ? 0 : 1),
          totalCoins: prev.totalCoins + (coins || 0),
        };
        saveStats(next);
        return next;
      });
    },
    []
  );

  const addCoins = useCallback((amount) => {
    setStats((prev) => {
      const next = { ...prev, totalCoins: prev.totalCoins + (amount || 0) };
      saveStats(next);
      return next;
    });
  }, []);

  const resetProgress = useCallback(async () => {
    await resetAllProgress();
    setStats({ ...DEFAULT_STATS });
  }, []);

  const value = useMemo(
    () => ({
      ready,
      stats,
      settings,
      updateSettings,
      recordGameResult,
      addCoins,
      resetProgress,
    }),
    [ready, stats, settings, updateSettings, recordGameResult, addCoins, resetProgress]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
