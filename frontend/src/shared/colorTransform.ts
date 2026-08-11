/**
 * colorTransform.ts — Role-Aware OKLCH Color Engine
 *
 * Converts any arbitrary HEX color chosen by the user (Light Mode source)
 * into a perceptually balanced Dark Mode counterpart.
 *
 * KEY PRINCIPLE: The transformation is driven by the SEMANTIC ROLE of the
 * color (background, text, border, accent), NOT by guessing the role from
 * the color value itself. The same #7C3AED used as a background transforms
 * differently than when used as text or a border.
 *
 * All math is done in OKLCH (Oklab Lightness-Chroma-Hue) for perceptual
 * uniformity. Hue is always preserved. Chroma is only adjusted when
 * necessary for gamut safety or visual balance.
 *
 * The rest of the application imports only `deriveDarkColor` from this
 * module. If `culori` is ever removed, only this file needs updating.
 */

import { converter, formatHex, clampChroma, parse } from 'culori';

const toOklch = converter('oklch');

// ─── Semantic Roles ───────────────────────────────────────────────
export type ColorRole =
  | 'background'   // Container / card / section surfaces
  | 'text'         // Foreground text (headings, paragraphs)
  | 'border'       // Border lines, dividers, separators
  | 'accent'       // Interactive / emphasis (button bg, badges)
  | 'input'        // Form input backgrounds
  | 'icon';        // Icon fill colors

// ─── Public API ───────────────────────────────────────────────────

/**
 * Given a Light Mode HEX color and its semantic role, returns the
 * perceptually balanced Dark Mode counterpart HEX string.
 *
 * Returns the input unchanged for non-hex values (transparent, inherit, etc.)
 */
export function deriveDarkColor(hex: string, role: ColorRole): string {
  // Pass through non-color values unchanged
  if (!hex || hex === 'transparent' || hex === 'inherit' || hex === 'currentColor') {
    return hex;
  }

  // Normalise shorthand and parse
  const parsed = parse(hex);
  if (!parsed) return hex;

  const oklch = toOklch(parsed);
  if (!oklch) return hex;

  const L = oklch.l ?? 0;   // Perceptual lightness  [0..1]
  const C = oklch.c ?? 0;   // Chroma (saturation)   [0..~0.37]
  const H = oklch.h ?? 0;   // Hue angle             [0..360]

  let darkL: number;
  let darkC: number;

  switch (role) {
    // ─── BACKGROUND / SURFACE ───────────────────────────────
    // Light backgrounds (whites, near-whites) → dark surfaces.
    // Saturated backgrounds → retain hue but darken significantly
    // so child content remains readable.
    case 'background':
    case 'input': {
      if (L > 0.93 && C < 0.03) {
        // Near-white → very dark neutral  (like #ffffff → #1a1a1e)
        darkL = 0.18;
        darkC = Math.min(C, 0.005);
      } else if (L > 0.80 && C < 0.05) {
        // Off-white / light gray → dark gray with hint of original tint
        darkL = 0.20;
        darkC = Math.min(C * 0.6, 0.015);
      } else if (L < 0.25) {
        // Already very dark → keep it dark, nudge slightly lighter for input
        darkL = role === 'input' ? 0.22 : L;
        darkC = C * 0.7;
      } else {
        // Saturated / mid-tone background → darken to ~0.25 while
        // retaining enough chroma to preserve hue identity.
        darkL = Math.max(0.20, L * 0.35);
        darkC = Math.min(C * 0.8, 0.12);
      }

      // Inputs get a slightly elevated surface to separate from bg
      if (role === 'input' && darkL < 0.23) darkL = 0.23;
      break;
    }

    // ─── TEXT / FOREGROUND ───────────────────────────────────
    // Dark text on light bg → light text on dark bg.
    // Already-light text → keep it light (it was intentional).
    // Saturated text → boost lightness for dark-bg contrast while
    // keeping the hue vibrant.
    case 'text': {
      if (L < 0.25 && C < 0.03) {
        // Near-black text → pure white
        darkL = 1.0;
        darkC = 0;
      } else if (L < 0.35) {
        // Dark text → high lightness / pure white
        darkL = 1.0;
        darkC = C * 0.2;
      } else if (L > 0.85) {
        // Already very light text → user intended light-on-dark;
        // keep it essentially the same.
        darkL = Math.min(L, 0.95);
        darkC = C;
      } else {
        // Mid-range / saturated text → push to L ≈ 0.80-0.85
        // so it's clearly readable on dark surfaces.
        darkL = Math.max(0.78, Math.min(0.88, 1.0 - L * 0.3));
        darkC = Math.min(C * 1.05, 0.20); // slight vibrancy bump
      }
      break;
    }

    // ─── BORDER / DIVIDER ───────────────────────────────────
    // Borders should remain subtle. In dark mode they sit between
    // the dark surface (L≈0.18) and content, so they need to be
    // just visible — L around 0.30-0.40 for light-source borders,
    // lower for already-dark borders.
    case 'border': {
      if (L > 0.80 && C < 0.04) {
        // Light gray border → dark-mode subtle border
        darkL = 0.32;
        darkC = Math.min(C, 0.01);
      } else if (L < 0.30) {
        // Already dark border → lighten slightly
        darkL = 0.40;
        darkC = C * 0.6;
      } else {
        // Saturated or mid-tone border
        darkL = Math.max(0.35, Math.min(0.50, L * 0.55));
        darkC = Math.min(C * 0.7, 0.10);
      }
      break;
    }

    // ─── ACCENT / INTERACTIVE ───────────────────────────────
    // Buttons, badges, interactive highlights. These must remain
    // recognisable and vibrant. We keep chroma high and only
    // adjust lightness to ensure contrast against dark surfaces
    // (L≈0.18) — target range L≈0.55-0.70.
    case 'accent':
    case 'icon': {
      if (L > 0.85 && C < 0.03) {
        // Near-white accent (unusual but possible) → still contrast
        darkL = 0.85;
        darkC = C;
      } else if (L < 0.40) {
        // Dark accent → brighten so it pops on dark bg
        darkL = Math.min(0.65, L + 0.25);
        darkC = Math.min(C * 1.15, 0.25);
      } else if (L > 0.75) {
        // Very bright accent → pull back slightly for dark bg
        darkL = Math.max(0.60, L - 0.12);
        darkC = Math.min(C * 1.05, 0.25);
      } else {
        // Sweet spot — adjust only if needed for dark-bg contrast
        darkL = Math.max(0.55, Math.min(0.72, L * 1.05));
        darkC = Math.min(C * 1.08, 0.25);
      }
      break;
    }

    default: {
      // Fallback: gentle lightness mirror
      darkL = L > 0.5 ? 1.0 - L : L + 0.3;
      darkC = C;
    }
  }

  // Clamp to sRGB gamut while preserving hue
  const darkOklch = clampChroma(
    { mode: 'oklch', l: darkL, c: darkC, h: H },
    'oklch'
  );

  return formatHex(darkOklch);
}
