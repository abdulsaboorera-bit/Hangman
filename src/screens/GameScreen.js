import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import AppBackground from '../components/AppBackground';
import HangmanFigure from '../components/HangmanFigure';
import WordDisplay from '../components/WordDisplay';
import Keyboard from '../components/Keyboard';
import AttemptsBar from '../components/AttemptsBar';
import PrimaryButton from '../components/PrimaryButton';
import useHangmanGame from '../hooks/useHangmanGame';
import { useFeedback } from '../services/useFeedback';
import * as HapticsSvc from '../services/hapticsService';
import { showRewarded, initAds, getAdsRemoved, ADS_AVAILABLE, isRewardedLoaded } from '../services/ads';
import { getClue } from '../data/clues';
import { MAX_WRONG, HINT_COST } from '../utils/gameLogic';
import { CATEGORIES, DIFFICULTIES } from '../data/words';
import { COLORS, FONT, FONT_SIZES, SPACING, RADIUS, GRADIENTS, SHADOW } from '../constants/theme';

export default function GameScreen({ navigation, route }) {
  const category = route.params?.category || 'animals';
  const difficulty = route.params?.difficulty || 'easy';
  const { game, startGame, guess, applyHint, revive } = useHangmanGame();
  const { play } = useFeedback();
  const [paused, setPaused] = useState(false);
  const [hintFlash, setHintFlash] = useState(false);
  const [clueText, setClueText] = useState(null);
  const [showRevive, setShowRevive] = useState(false);
  const handledRef = useRef(false);
  const clueShownRef = useRef(false);

  const categoryMeta = CATEGORIES.find((c) => c.id === category);
  const difficultyMeta = DIFFICULTIES.find((d) => d.id === difficulty);

  useEffect(() => {
    startGame(category, difficulty);
  }, [category, difficulty, startGame]);

  const status = game?.status;
  const isOver = status === 'won' || status === 'lost';

  useEffect(() => {
    if (!isOver) return;
    if (status === 'won') {
      play('win');
      HapticsSvc.success();
    } else {
      play('gameover');
      HapticsSvc.error();
    }
  }, [isOver, status, play]);

  useEffect(() => {
    if (!isOver || handledRef.current) return;
    handledRef.current = true;
    const timer = setTimeout(() => {
      if (status === 'won') {
        navigation.replace('Win', {
          category,
          difficulty,
          score: game.score,
          word: game.word,
          wrongCount: game.wrongLetters.length,
          hintsUsed: game.hintsUsed,
        });
      } else if (game.revived) {
        navigation.replace('GameOver', {
          category,
          difficulty,
          score: game.score,
          word: game.word,
          wrongCount: game.wrongLetters.length,
        });
      } else {
        setShowRevive(true);
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [isOver, status, navigation, category, difficulty, game]);

  const handleGuess = useCallback(
    (letter) => {
      if (paused || isOver || !game) return;
      const wasCorrect = game.word.includes(letter);
      const alreadyGuessed = game.guessedLetters.includes(letter);
      if (alreadyGuessed) return;
      guess(letter);
      if (wasCorrect) {
        play('correct');
        HapticsSvc.tapLight();
      } else {
        play('wrong');
        HapticsSvc.tapMedium();
      }
    },
    [paused, isOver, game, guess, play]
  );

  const handleHint = useCallback(() => {
    if (!game || game.hintsLeft <= 0 || isOver) return;
    if (!clueShownRef.current) {
      clueShownRef.current = true;
      const clue = getClue(game.word, game.category);
      if (clue) setClueText(clue);
    }
    applyHint();
    play('hint');
    HapticsSvc.tapLight();
    setHintFlash(true);
    setTimeout(() => setHintFlash(false), 600);
  }, [game, isOver, applyHint, play]);

  const handleRestart = useCallback(() => {
    handledRef.current = false;
    clueShownRef.current = false;
    setClueText(null);
    setShowRevive(false);
    setPaused(false);
    play('click');
    startGame(category, difficulty);
  }, [category, difficulty, startGame, play]);

  const handleReviveContinue = useCallback(async () => {
    handledRef.current = false;
    setShowRevive(false);
    if (getAdsRemoved() || !ADS_AVAILABLE) {
      play('revive');
      revive();
      return;
    }
    await initAds();
    if (!isRewardedLoaded()) {
      play('revive');
      revive();
      return;
    }
    const earned = await showRewarded(() => {});
    if (earned) {
      play('revive');
      revive();
    } else {
      navigation.replace('GameOver', {
        category,
        difficulty,
        score: game?.score || 0,
        word: game?.word || '',
        wrongCount: game?.wrongLetters.length || 0,
      });
    }
  }, [revive, navigation, category, difficulty, game]);

  const handleReviveGiveUp = useCallback(() => {
    setShowRevive(false);
    navigation.replace('GameOver', {
      category,
      difficulty,
      score: game?.score || 0,
      word: game?.word || '',
      wrongCount: game?.wrongLetters.length || 0,
    });
  }, [navigation, category, difficulty, game]);

  if (!game) {
    return (
      <AppBackground>
        <View style={styles.center}>
          <Text style={styles.loadingText}>Loading word...</Text>
        </View>
      </AppBackground>
    );
  }

  const wrongCount = game.wrongLetters.length;

  return (
    <AppBackground>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <Pressable
            onPress={() => {
              play('pause');
              HapticsSvc.tapLight();
              setPaused(true);
            }}
            style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
            hitSlop={8}
          >
            <Text style={styles.iconBtnText}>⏸</Text>
          </Pressable>

          <View style={styles.titleWrap}>
            <Text style={styles.categoryText}>
              {categoryMeta?.icon} {categoryMeta?.name}
            </Text>
            <Text style={styles.difficultyText}>{difficultyMeta?.name}</Text>
          </View>

          <View style={styles.scorePill}>
            <Text style={styles.scoreLabel}>SCORE</Text>
            <Text style={styles.scoreValue}>{game.score}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <AttemptsBar wrongCount={wrongCount} maxWrong={MAX_WRONG} />
          <View style={styles.hintPill}>
            <Text style={styles.hintPillText}>💡 {game.hintsLeft}</Text>
          </View>
        </View>

        {clueText ? (
          <Pressable onPress={() => setClueText(null)} style={styles.clueCard} hitSlop={6}>
            <Text style={styles.clueBadge}>💡 CLUE</Text>
            <Text style={styles.clueText}>{clueText}</Text>
            <Text style={styles.clueDismiss}>tap to hide</Text>
          </Pressable>
        ) : null}

        <View style={styles.figureWrap}>
          <HangmanFigure wrongCount={wrongCount} />
        </View>

        <View style={styles.wordWrap}>
          <WordDisplay word={game.word} guessedLetters={game.guessedLetters} />
        </View>

        <View style={styles.actionsRow}>
          <Pressable
            onPress={handleHint}
            disabled={game.hintsLeft <= 0 || isOver}
            style={({ pressed }) => [
              styles.actionBtn,
              hintFlash && styles.actionFlash,
              (game.hintsLeft <= 0 || isOver) && styles.actionDisabled,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.actionText}>💡 Hint ({HINT_COST})</Text>
          </Pressable>
          <Pressable
            onPress={handleRestart}
            style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}
          >
            <Text style={styles.actionText}>🔄 Restart</Text>
          </Pressable>
        </View>

        <View style={styles.keyboardWrap}>
          <Keyboard
            guessedLetters={game.guessedLetters}
            correctLetters={game.correctLetters}
            wrongLetters={game.wrongLetters}
            onGuess={handleGuess}
            disabled={paused || isOver}
          />
        </View>
      </View>

      <Modal visible={paused} transparent animationType="fade" onRequestClose={() => setPaused(false)}>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Paused</Text>
            <Text style={styles.modalSubtitle}>Take a breath, hero!</Text>
            <PrimaryButton label="▶  Resume" onPress={() => setPaused(false)} style={styles.modalBtn} />
            <PrimaryButton
              label="🔄 Restart"
              colors={['#2f3b5c', '#3d4f7c']}
              onPress={handleRestart}
              style={styles.modalBtn}
            />
            <PrimaryButton
              label="🏠 Home"
              colors={['#2f3b5c', '#3d4f7c']}
              onPress={() => navigation.navigate('Home')}
              style={styles.modalBtn}
            />
          </View>
        </View>
      </Modal>

      <Modal visible={showRevive} transparent animationType="fade" onRequestClose={() => {}}>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>😬 So close!</Text>
            <Text style={styles.modalSubtitle}>
              You ran out of attempts. Use a revive to continue this round?
            </Text>
            <PrimaryButton
              label={ADS_AVAILABLE && !getAdsRemoved() ? '📺 Watch Ad to Revive' : '💪 Free Revive'}
              colors={GRADIENTS.success}
              onPress={handleReviveContinue}
              style={styles.modalBtn}
            />
            <PrimaryButton
              label="Give Up"
              colors={['#2f3b5c', '#3d4f7c']}
              onPress={handleReviveGiveUp}
              style={styles.modalBtn}
            />
          </View>
        </View>
      </Modal>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: SPACING.xl,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: COLORS.textDim,
    fontFamily: FONT.semibold,
    fontSize: FONT_SIZES.md,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  iconBtnText: {
    fontSize: 18,
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.97 }],
  },
  titleWrap: {
    alignItems: 'center',
  },
  categoryText: {
    color: COLORS.text,
    fontFamily: FONT.extrabold,
    fontSize: FONT_SIZES.md,
  },
  difficultyText: {
    color: COLORS.textDim,
    fontFamily: FONT.semibold,
    fontSize: FONT_SIZES.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scorePill: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 14,
    paddingVertical: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    minWidth: 74,
    ...SHADOW.card,
  },
  scoreLabel: {
    color: COLORS.textFaint,
    fontFamily: FONT.bold,
    fontSize: 9,
    letterSpacing: 1,
  },
  scoreValue: {
    color: COLORS.primaryAlt,
    fontFamily: FONT.extrabold,
    fontSize: FONT_SIZES.lg,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: 8,
  },
  hintPill: {
    backgroundColor: 'rgba(255, 217, 61, 0.15)',
    borderRadius: RADIUS.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 217, 61, 0.35)',
  },
  hintPillText: {
    color: COLORS.coin,
    fontFamily: FONT.bold,
    fontSize: FONT_SIZES.sm,
  },
  clueCard: {
    backgroundColor: 'rgba(255, 217, 61, 0.12)',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 217, 61, 0.35)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.sm,
    alignItems: 'center',
  },
  clueBadge: {
    color: COLORS.coin,
    fontFamily: FONT.extrabold,
    fontSize: FONT_SIZES.xs,
    letterSpacing: 2,
    marginBottom: 2,
  },
  clueText: {
    color: COLORS.text,
    fontFamily: FONT.semibold,
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  clueDismiss: {
    color: COLORS.textFaint,
    fontFamily: FONT.semibold,
    fontSize: 10,
    marginTop: 4,
  },
  figureWrap: {
    alignItems: 'center',
    marginVertical: SPACING.xs,
  },
  wordWrap: {
    alignItems: 'center',
    marginVertical: SPACING.sm,
    minHeight: 56,
    justifyContent: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  actionBtn: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  actionFlash: {
    backgroundColor: 'rgba(255, 217, 61, 0.25)',
    borderColor: COLORS.coin,
  },
  actionDisabled: {
    opacity: 0.4,
  },
  actionText: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: FONT_SIZES.sm,
  },
  keyboardWrap: {
    marginTop: 'auto',
    paddingBottom: SPACING.sm,
  },
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  modalCard: {
    backgroundColor: COLORS.bgCardSolid,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    ...SHADOW.card,
  },
  modalTitle: {
    color: COLORS.text,
    fontFamily: FONT.extrabold,
    fontSize: FONT_SIZES.xl,
    textAlign: 'center',
  },
  modalSubtitle: {
    color: COLORS.textDim,
    fontFamily: FONT.semibold,
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  modalBtn: {
    width: '100%',
    marginBottom: SPACING.md,
  },
});
