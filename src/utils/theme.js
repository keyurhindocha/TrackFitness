export const COLORS = {
  // Backgrounds
  background: '#0a0a0a',
  backgroundSoft: '#111111',
  surface: '#1a1a1a',
  surfaceElevated: '#222222',

  // Brand
  primary: '#ff6b35',
  primaryLight: 'rgba(255, 107, 53, 0.15)',
  primarySoft: 'rgba(255, 107, 53, 0.10)',
  primaryStrong: '#e85a25',

  // Text
  text: '#ffffff',
  textSecondary: '#888888',
  textMuted: '#444444',

  // Borders
  border: '#2a2a2a',
  borderStrong: '#3d3d3d',

  // Semantic
  success: '#4ade80',
  successSoft: 'rgba(74, 222, 128, 0.12)',
  danger: '#f87171',
  dangerSoft: 'rgba(248, 113, 113, 0.12)',
  highlight: '#fbbf24',
  highlightSoft: 'rgba(251, 191, 36, 0.12)',
  secondary: '#818cf8',
  secondarySoft: 'rgba(129, 140, 248, 0.12)',

  // Utility
  white: '#ffffff',
  overlay: 'rgba(0, 0, 0, 0.65)',
};

export const LAYOUT = {
  screenPadding: 16,
  cardRadius: 16,
  pillRadius: 100,
};

export const SHADOWS = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
};

export const CALENDAR_THEME = {
  backgroundColor: 'transparent',
  calendarBackground: 'transparent',
  textSectionTitleColor: COLORS.textSecondary,
  selectedDayBackgroundColor: COLORS.primary,
  selectedDayTextColor: '#fff',
  todayTextColor: COLORS.primary,
  dayTextColor: COLORS.text,
  textDisabledColor: COLORS.textMuted,
  dotColor: COLORS.primary,
  selectedDotColor: '#fff',
  arrowColor: COLORS.primary,
  monthTextColor: COLORS.text,
  indicatorColor: COLORS.primary,
  textDayFontWeight: '500',
  textMonthFontWeight: '700',
  textDayHeaderFontWeight: '600',
};
