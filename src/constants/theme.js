export const COLORS = {
  bgDeep: '#1a1a2e',
  bgMid: '#16213e',
  bgCard: 'rgba(255, 255, 255, 0.08)',
  bgCardSolid: '#222b45',
  primary: '#FF6B6B',
  primaryAlt: '#FFA502',
  success: '#2ED573',
  danger: '#FF4757',
  warning: '#FFC312',
  text: '#FFFFFF',
  textDim: 'rgba(255, 255, 255, 0.65)',
  textFaint: 'rgba(255, 255, 255, 0.40)',
  keyDefault: '#2f3b5c',
  keyDisabled: '#1e2740',
  coin: '#FFD93D',
  overlay: 'rgba(10, 10, 25, 0.75)',
};

export const GRADIENTS = {
  background: [COLORS.bgDeep, COLORS.bgMid],
  button: ['#FF6B6B', '#FFA502'],
  playButton: ['#FF6B6B', '#FF8E53'],
  success: ['#2ED573', '#17B978'],
  danger: ['#FF4757', '#FF6B81'],
  card: ['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.04)'],
  coin: ['#FFD93D', '#FFA502'],
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  sm: 8,
  md: 16,
  lg: 24,
  pill: 999,
};

export const FONT = {
  regular: 'Nunito_400Regular',
  semibold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  extrabold: 'Nunito_800ExtraBold',
};

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 26,
  xxl: 34,
  huge: 44,
};

export const SHADOW = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  button: {
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
};
