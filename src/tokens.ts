import type { CSSProperties } from 'react';

// ─── Design Tokens ────────────────────────────────────────────────────────────

export const color = {
  text: '#111',
  textMuted: '#888',
  textSubtle: '#aaa',
  textFaint: '#bbb',
  white: '#fff',
  bgPage: '#FFFFFF',
  bgInput: '#fafafa',
  bgHighlight: '#f5f5f5',
  divider: '#f0f0f0',
  border: '#e0e0e0',
  borderSubtle: '#ebebeb',
  borderCard: '#e8e8e8',
  borderDashed: '#d0d0d0',
  focus: '#000',
  disabled: '#e0e0e0',
  disabledText: '#aaa',
  success: '#22C55E',
  accent: '#90ADFB',
  accentMuted: '#EEF2FF',
} as const;

export const space = {
  1: 2, 2: 4, 3: 6, 4: 8,
  5: 10, 6: 12, 7: 14, 8: 16,
  10: 20, 12: 28, 14: 32,
} as const;

export const radius = {
  sm: 6,
  md: 8,
  lg: 10,
  full: '50%' as const,
} as const;

export const fontSize = {
  micro: 10, xxs: 11, xs: 12, sm: 13,
  body: 14, md: 15, lg: 16, xl: 18,
} as const;

export const fontWeight = {
  regular: 400, medium: 500, semibold: 600, bold: 700,
} as const;

export const shadow = {
  card: '0 1px 4px rgba(0,0,0,0.05)',
  cardSubtle: '0 1px 3px rgba(0,0,0,0.04)',
  dropdown: '0 4px 16px rgba(0,0,0,0.08)',
  cardHover: '0 6px 20px rgba(0,0,0,0.09)',
} as const;

// ─── Pattern Objects ──────────────────────────────────────────────────────────
// Shared style objects for the three most-repeated UI patterns.
// Spread into `style` props: style={{ ...button.ghost, marginBottom: 28 }}
// Or use directly:           style={card.origin(isDone)}

export const input = {
  /** Station input composite wrapper (flex row with border) */
  wrapper: (focused: boolean): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    border: `1px solid ${focused ? color.accent : color.border}`,
    borderRadius: radius.md,
    height: 44,
    padding: '0 14px',
    background: color.white,
    transition: 'border-color 0.18s',
    boxShadow: 'none',
  }),
  /** Bare <input> inside the station wrapper */
  field: {
    border: 'none',
    outline: 'none',
    fontSize: fontSize.md,
    flex: 1,
    background: 'transparent',
    color: color.text,
  } as CSSProperties,
  /** Standalone name <input> (no wrapper) */
  nameField: (focused: boolean): CSSProperties => ({
    width: '100%',
    height: 44,
    padding: '0 14px',
    borderRadius: radius.md,
    border: `1px solid ${focused ? color.accent : color.border}`,
    boxShadow: 'none',
    fontSize: fontSize.body,
    color: color.text,
    outline: 'none',
    boxSizing: 'border-box',
    background: color.white,
    transition: 'border-color 0.18s',
  }),
};

export const button = {
  /** Primary dark full-width CTA (OriginScreen submit) */
  primaryCta: (enabled: boolean): CSSProperties => ({
    width: '100%',
    height: 56,
    borderRadius: radius.lg,
    border: 'none',
    background: enabled ? color.accent : color.disabled,
    color: enabled ? color.white : color.disabledText,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    cursor: enabled ? 'pointer' : 'not-allowed',
    transition: 'background 0.15s',
  }),
  /** Accent full-width CTA that navigates forward (ResultScreen) */
  forwardCta: {
    width: '100%',
    padding: '15px',
    borderRadius: radius.lg,
    border: 'none',
    background: color.accent,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: color.white,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[3],
  } as CSSProperties,
  /** Outline full-width CTA for secondary/reset actions (PlaceScreen) */
  secondaryCta: {
    width: '100%',
    padding: '15px',
    borderRadius: radius.lg,
    border: `1px solid ${color.border}`,
    background: color.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: '#333',
    cursor: 'pointer',
  } as CSSProperties,
  /** Invisible back/nav button (← text) */
  ghost: {
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    padding: 0,
    fontSize: fontSize.body,
    color: color.textMuted,
    marginBottom: space[12],
    display: 'flex',
    alignItems: 'center',
    gap: space[2],
  } as CSSProperties,
  /** Small inline action button — neutral variant (공유, 지도보기) */
  small: {
    padding: '5px 10px',
    border: `1px solid ${color.border}`,
    borderRadius: radius.lg,
    background: color.white,
    cursor: 'pointer',
    fontSize: fontSize.xxs,
    color: '#666',
    fontWeight: fontWeight.medium,
    whiteSpace: 'nowrap' as const,
  } as CSSProperties,
  /** Plain text "add origin" button — no border */
  addOrigin: {
    marginTop: space[6],
    width: '100%',
    padding: '12px',
    border: 'none',
    borderRadius: radius.lg,
    background: 'none',
    cursor: 'pointer',
    fontSize: fontSize.body,
    color: color.textMuted,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[3],
  } as CSSProperties,
};

export const card = {
  /** Origin entry card — accent border when complete, light border when not */
  origin: (done: boolean): CSSProperties => ({
    background: '#F9F9F9',
    borderRadius: radius.lg,
    border: done ? `1.5px solid ${color.accent}` : `1px solid ${color.border}`,
    padding: '16px',
    boxShadow: 'none',
    transition: 'border-color 0.2s',
  }),
  /** Candidate station result card with line color accents */
  candidate: (isSelected: boolean, isTop: boolean, lineColor: string): CSSProperties => ({
    borderRadius: radius.lg,
    border: isSelected
      ? `1.5px solid ${lineColor}`
      : isTop ? `1.5px solid ${lineColor}60`
        : `1.5px solid ${color.borderSubtle}`,
    background: color.white,
    marginBottom: space[6],
    cursor: 'pointer',
    overflow: 'hidden',
    boxShadow: isSelected ? `0 4px 20px ${lineColor}28` : shadow.card,
    transition: 'box-shadow 0.2s, border-color 0.2s',
  }),
  /** Place list card with category accent color */
  place: (isSelected: boolean, accentColor: string): CSSProperties => ({
    borderRadius: radius.lg,
    border: isSelected
      ? `1.5px solid ${accentColor}`
      : `1.5px solid ${color.borderSubtle}`,
    background: color.white,
    marginBottom: space[4],
    cursor: 'pointer',
    boxShadow: isSelected ? `0 2px 12px ${accentColor}18` : shadow.cardSubtle,
    transition: 'box-shadow 0.2s, border-color 0.2s',
  }),
};
