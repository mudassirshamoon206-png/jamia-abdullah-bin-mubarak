---
name: Majestic Academic
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e4e2e1'
  on-surface: '#1b1c1c'
  on-surface-variant: '#404944'
  inverse-surface: '#303030'
  inverse-on-surface: '#f3f0f0'
  outline: '#707974'
  outline-variant: '#bfc9c3'
  surface-tint: '#2b6954'
  primary: '#003527'
  on-primary: '#ffffff'
  primary-container: '#064e3b'
  on-primary-container: '#80bea6'
  inverse-primary: '#95d3ba'
  secondary: '#735c00'
  on-secondary: '#ffffff'
  secondary-container: '#fed65b'
  on-secondary-container: '#745c00'
  tertiary: '#2e2e2a'
  on-tertiary: '#ffffff'
  tertiary-container: '#454440'
  on-tertiary-container: '#b3b1ac'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b0f0d6'
  primary-fixed-dim: '#95d3ba'
  on-primary-fixed: '#002117'
  on-primary-fixed-variant: '#0b513d'
  secondary-fixed: '#ffe088'
  secondary-fixed-dim: '#e9c349'
  on-secondary-fixed: '#241a00'
  on-secondary-fixed-variant: '#574500'
  tertiary-fixed: '#e5e2dc'
  tertiary-fixed-dim: '#c9c6c1'
  on-tertiary-fixed: '#1c1c18'
  on-tertiary-fixed-variant: '#474743'
  background: '#fcf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e1'
typography:
  display-lg:
    fontFamily: Noto Serif
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Noto Serif
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-md:
    fontFamily: Noto Serif
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-rt:
    fontFamily: Noto Serif
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-ur-ar:
    fontFamily: Noto Naskh Arabic
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 32px
  label-sm:
    fontFamily: Noto Serif
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
  direction-ltr: ltr
  direction-rtl: rtl
---

## Brand & Style
The design system embodies a scholarly, prestigious, and culturally resonant atmosphere tailored for academic excellence. The brand personality is authoritative yet welcoming, focusing on intellectual depth and historical continuity. 

The aesthetic is a fusion of **Minimalism** and **Modern Corporate**, elevated by traditional motifs. It strictly prohibits the use of photography or human imagery to maintain a focus on abstract beauty and universal accessibility. In place of imagery, the system utilizes complex Islamic geometric patterns and sophisticated typography. The visual language evokes a sense of "digital manuscript"—clean, structured, and timeless.

## Colors
The palette is rooted in a traditional academic and cultural spectrum:
- **Deep Emerald (#064E3B):** Represents growth and wisdom. Used for primary actions, navigation backgrounds, and structural headings.
- **Gold (#D4AF37):** Symbolizes excellence and value. Used for highlights, active states, and decorative geometric borders.
- **Off-White (#F9F6F0):** The "parchment" base. Provides a soft, high-legibility background that reduces eye strain compared to pure white.
- **Charcoal Neutral (#2D2D2D):** Used for primary body text to ensure maximum contrast and accessibility against the off-white background.

## Typography
This design system employs a dual-script typographic strategy to ensure parity between English and RTL languages (Urdu/Arabic).

1.  **Latin Script:** **Noto Serif** is used for all English text, providing an authoritative, literary feel.
2.  **Arabic Script:** **Noto Naskh Arabic** is the standard for Urdu and Arabic. Note that the font size for Arabic script is increased by 2px relative to Latin equivalents to maintain visual weight and legibility.
3.  **Scale:** Headlines use a high-contrast ratio to denote hierarchy. Body text maintains generous line-height (1.5x - 1.8x) to accommodate the intricate descenders of Naskh scripts.

## Layout & Spacing
The layout follows a **Fixed Grid** model on desktop and a **Fluid Grid** on mobile.

- **Multilingual Support:** The layout direction must dynamically toggle based on the language. In `rtl` mode (Urdu/Arabic), the entire grid system, including the placement of logos, navigation items, and icons, must mirror horizontally.
- **Rhythm:** An 8px linear scale is used for all padding and margins. 
- **Margins:** Desktop views require wide horizontal margins (48px) to reflect the generous white space of classical manuscript layouts.

## Elevation & Depth
Depth is communicated through **Tonal Layers** rather than heavy shadows. 
- **Base Level:** The Off-White (#F9F6F0) surface.
- **Raised Level:** Slight tonal shifts (e.g., a 2% darker tint of the base) are used for cards and containers.
- **Dividers:** Instead of shadows, use 1px "Gold" (#D4AF37) lines or geometric patterns to separate sections.
- **Interaction:** Elevated states (hover) use a thin Emerald border or a subtle Gold glow effect to indicate focus.

## Shapes
The shape language is **Soft** but structured. 
- **Corners:** Standard UI elements use a 0.25rem (4px) radius. This creates a professional look that is neither too sharp (aggressive) nor too rounded (playful).
- **Geometric Motifs:** Decorative elements should utilize 8-point star (Rub el Hizb) geometries. These are used as background watermarks or small separators.
- **Avatars:** User representations must use a stylized, neutral silhouette or a geometric pattern based on the user's initials; never use photos.

## Components
- **Buttons:** Primary buttons are solid Deep Emerald with Gold text for high-contrast emphasis. Secondary buttons use a Gold border with Deep Emerald text.
- **Placeholders:** Every instance where an image would typically reside must be replaced by an **Islamic Geometric Placeholder**. These are SVG-based patterns using Emerald and Gold gradients.
- **Avatars:** Neutral icons only. Use a geometric shield shape or a circle containing a Noto Serif/Naskh initial.
- **Input Fields:** Fields are outlined with a thin charcoal border. On focus, the border transitions to Gold. For RTL languages, the label and text alignment must flip to the right.
- **Chips:** Small, Soft-rounded elements with a light Gold background and Emerald text, used for categories or tags.
- **Cards:** Use a flat background color (1% darker than page base) with a 1px border. A small 8-point star motif may be placed in the corner of featured cards.