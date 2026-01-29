/**
 * Codebasics Assess Theme
 * Brand colors consistent with codebasics.io (Blue/White theme)
 */

export const COLORS = {
  // Primary Brand Colors
  primary: '#1E3A8A',      // Deep Blue
  primaryLight: '#3B82F6', // Bright Blue
  primaryDark: '#1E40AF',  // Darker Blue

  // Secondary Colors
  secondary: '#10B981',    // Green (Success)
  accent: '#F59E0B',       // Amber (Warnings/Highlights)

  // Neutral Colors
  white: '#FFFFFF',
  black: '#000000',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  border: '#E2E8F0',

  // Text Colors
  text: '#1E293B',
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  textLight: '#94A3B8',
  textInverse: '#FFFFFF',

  // Status Colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Score Colors
  scoreExcellent: '#10B981',  // Green for 70%+
  scoreGood: '#10B981',
  scoreModerate: '#F59E0B',   // Yellow for 50-69%
  scorePartial: '#F97316',    // Orange for 30-49%
  scoreLow: '#EF4444',        // Red for below 30%

  // Role Colors
  roleDA: '#3B82F6',   // Blue for Data Analyst
  roleDS: '#8B5CF6',   // Purple for Data Scientist
  roleDE: '#10B981',   // Green for Data Engineer

  // Gradient Colors
  gradientStart: '#1E3A8A',
  gradientEnd: '#3B82F6',
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    title: 28,
    hero: 40,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};

// User Levels based on XP (from PRD Section 12.1)
export const LEVELS = [
  { level: 1, name: 'Beginner', minXp: 0 },
  { level: 2, name: 'Explorer', minXp: 500 },
  { level: 3, name: 'Learner', minXp: 1500 },
  { level: 4, name: 'Achiever', minXp: 3500 },
  { level: 5, name: 'Expert', minXp: 7000 },
  { level: 6, name: 'Master', minXp: 12000 },
];

export default {
  COLORS,
  FONTS,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
  LEVELS,
};
