/**
 * src/tokens.js
 *
 * Single source of truth for all design tokens.
 * Import this instead of copy-pasting the same object into every page.
 *
 * Usage:
 *   import { T, getTheme } from "@/tokens"
 *   const th = getTheme(dark)
 */

// ── Brand & semantic colors ───────────────────────────────────────────────────
export const T = {
  // Primary brand
  amber:          "#F59E0B",
  amberHover:     "#D97706",
  amberDim:       "rgba(245,158,11,0.10)",
  amberBorder:    "rgba(245,158,11,0.25)",
  amberRing:      "rgba(245,158,11,0.30)",
  amberText:      "#1C1917",          // text ON amber background

  // Semantic
  success:        "#22C55E",
  successDim:     "rgba(34,197,94,0.10)",
  successBorder:  "rgba(34,197,94,0.25)",

  danger:         "#EF4444",
  dangerDim:      "rgba(239,68,68,0.10)",
  dangerBorder:   "rgba(239,68,68,0.30)",

  info:           "#60A5FA",
  infoDim:        "rgba(96,165,250,0.10)",
  infoBorder:     "rgba(96,165,250,0.25)",

  warning:        "#F97316",
  warningDim:     "rgba(249,115,22,0.10)",
  warningBorder:  "rgba(249,115,22,0.25)",

  // AI accent
  ai:             "#8B5CF6",
  aiDim:          "rgba(139,92,246,0.10)",
  aiBorder:       "rgba(139,92,246,0.25)",

  // Typography
  font:           "'DM Sans', sans-serif",
  fontSerif:      "'DM Serif Display', serif",
  fontMono:       "'JetBrains Mono', 'Fira Code', monospace",
};

// ── Surface themes (dark / light) ─────────────────────────────────────────────
const dark = {
  // Sidebar
  sidebar:           "#0C0A09",
  sidebarBorder:     "#181410",
  navText:           "#6B6560",
  navTextHover:      "#C7C0BA",
  navTextActive:     "#F5F5F4",
  navHoverBg:        "rgba(255,255,255,0.04)",
  navActiveBg:       "rgba(245,158,11,0.09)",
  sectionLabel:      "#352E2A",

  // Page surfaces
  page:              "#1C1917",
  surface:           "#242020",
  surfaceUp:         "#2D2926",
  surfaceHover:      "#322E2B",

  // Borders
  border:            "#2A2622",
  borderUp:          "#3D3935",

  // Text
  textPrimary:       "#F5F5F4",
  textSecondary:     "#A8A29E",
  textMuted:         "#57534E",
  textDisabled:      "#3D3935",

  // Topbar
  topbarBg:          "#1C1917",
  topbarBorder:      "#242020",

  // Controls
  inputBg:           "#2D2926",
  toggleBg:          "#292524",
  toggleText:        "#A8A29E",

  // Overlays
  overlay:           "rgba(0,0,0,0.65)",

  // Error/feedback (in-surface)
  errorBg:           "rgba(239,68,68,0.10)",
  errorBorder:       "rgba(239,68,68,0.30)",
};

const light = {
  // Sidebar
  sidebar:           "#1A2744",
  sidebarBorder:     "#243255",
  navText:           "#7A90B0",
  navTextHover:      "#C8D8F0",
  navTextActive:     "#F8FAFC",
  navHoverBg:        "rgba(255,255,255,0.06)",
  navActiveBg:       "rgba(245,158,11,0.14)",
  sectionLabel:      "#2E4070",

  // Page surfaces
  page:              "#FAFAF8",
  surface:           "#FFFFFF",
  surfaceUp:         "#F5F4F2",
  surfaceHover:      "#EEF0F1",

  // Borders
  border:            "#E7E5E4",
  borderUp:          "#D6D3D1",

  // Text
  textPrimary:       "#1C1917",
  textSecondary:     "#78716C",
  textMuted:         "#A8A29E",
  textDisabled:      "#D6D3D1",

  // Topbar
  topbarBg:          "#FAFAF8",
  topbarBorder:      "#E7E5E4",

  // Controls
  inputBg:           "#F5F4F2",
  toggleBg:          "#E7E5E4",
  toggleText:        "#78716C",

  // Overlays
  overlay:           "rgba(0,0,0,0.45)",

  // Error/feedback (in-surface)
  errorBg:           "#FEF2F2",
  errorBorder:       "rgba(239,68,68,0.30)",
};

/** Get the correct theme object based on dark flag */
export function getTheme(isDark) {
  return isDark ? dark : light;
}

// Named exports for direct destructuring
export const darkTheme  = dark;
export const lightTheme = light;
