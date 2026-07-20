---
name: Apex Retail Logic
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#424656'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#727687'
  outline-variant: '#c2c6d8'
  surface-tint: '#0054d6'
  primary: '#0050cb'
  on-primary: '#ffffff'
  primary-container: '#0066ff'
  on-primary-container: '#f8f7ff'
  inverse-primary: '#b3c5ff'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#4b5a70'
  on-tertiary: '#ffffff'
  tertiary-container: '#63738a'
  on-tertiary-container: '#f6f8ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae1ff'
  primary-fixed-dim: '#b3c5ff'
  on-primary-fixed: '#001849'
  on-primary-fixed-variant: '#003fa4'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#d3e4fe'
  tertiary-fixed-dim: '#b7c8e1'
  on-tertiary-fixed: '#0b1c30'
  on-tertiary-fixed-variant: '#38485d'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.03em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin: 32px
---

## Brand & Style

The design system is engineered for high-performance retail operations, blending the technical precision of developer tools with the sophisticated polish of premium fintech interfaces. The brand personality is authoritative yet unobtrusive, prioritizing clarity and speed of thought.

The visual style is **Corporate / Modern** with a strong emphasis on **Minimalism**. It leverages high-density information displays balanced by generous negative space to prevent cognitive overload. Key stylistic drivers include:
- **Precision:** Mathematical alignment and consistent stroke weights.
- **Clarity:** A "content-first" hierarchy where the UI recedes to highlight business data.
- **Tactile Polish:** Subtle interaction cues that provide immediate feedback, suggesting a robust and reactive engine under the hood.

## Colors

This design system utilizes a high-contrast palette designed for long-duration usage in professional environments. 

- **Primary (Premium Blue):** Used for primary actions, active states, and critical brand touchpoints.
- **Secondary (Deep Navy):** Primarily for typography and high-level navigation elements to provide a grounded, authoritative feel.
- **Neutral (Slate/Gray):** A sophisticated range of cool grays used for borders, subtle backgrounds, and de-emphasized text.
- **Semantic Palette:** High-saturation emerald, amber, and rose are used strictly for status signaling (e.g., stock levels, payment success, or system errors).

In Dark Mode, surfaces transition to deep charcoal (#121212) with navy accents, while Light Mode maintains a "Crisp White" (#FFFFFF) base to ensure maximum legibility of data tables.

## Typography

The typography system relies exclusively on **Inter** to achieve a systematic, utilitarian aesthetic. 

- **Headings:** Feature tight tracking (negative letter-spacing) and bold weights to create a sense of structural importance and "tightness" reminiscent of modern SaaS products.
- **Body Text:** Standard weight with natural tracking to ensure high readability during intensive data entry and review.
- **Labels:** Small caps or medium weights are used for metadata, table headers, and form labels to distinguish them clearly from user-generated content.

## Layout & Spacing

This design system adheres to a strict **8px square grid**. All spatial relationships, component heights, and icon containers must be multiples of 8.

- **Layout Model:** A fluid grid for data-heavy views (Dashboards, Inventory Tables) and a fixed-width, centered layout (max-width: 1200px) for settings and document creation.
- **Responsive Strategy:** 
  - **Desktop (1440px+):** 12-column grid, 24px gutters, side-navigation.
  - **Tablet (768px - 1439px):** 8-column grid, 16px gutters, collapsed side-navigation.
  - **Mobile (<767px):** 4-column grid, 16px margins, bottom-sheet navigation for primary actions.

## Elevation & Depth

The design system uses **Tonal Layers** combined with **Ambient Shadows** to define hierarchy. Depth is used sparingly to signify interactivity and temporary states.

- **Level 0 (Base):** The primary background color.
- **Level 1 (Cards/Containers):** Raised slightly using a 1px border (#E2E8F0) and a very soft, diffused shadow: `0 4px 6px -1px rgb(0 0 0 / 0.05)`.
- **Level 2 (Overlays/Dropdowns):** Higher elevation with a more pronounced shadow to indicate depth over content: `0 10px 15px -3px rgb(0 0 0 / 0.1)`.
- **Interaction:** Buttons and interactive cards should use a subtle "lift" effect on hover (shadow expansion) and a "press" effect (slight scale down to 0.98) to mimic physical tactility.

## Shapes

The shape language is defined by **Rounded** geometry. The standard 8px (0.5rem) radius creates a modern, approachable feel while remaining professional.

- **Small Components:** Checkboxes and small tags use 4px (Soft) to maintain precision.
- **Standard Components:** Buttons, Input fields, and List items use 8px (Rounded).
- **Large Containers:** Dashboard cards and Modals use 12px or 16px (Rounded-LG/XL) to create soft framing for complex data.

## Components

- **Buttons:** Primary buttons use the Premium Blue background with white text. Ghost buttons use a subtle slate border. Loading states must be indicated via a centered spinner, maintaining the button's exact dimensions.
- **Data Tables:** High-density with 1px horizontal dividers only. Row hover states should use the Neutral Light color (#F1F5F9). Columns containing currency or numbers must be right-aligned.
- **Input Fields:** Use a 1px border that shifts to Premium Blue on focus. Labels sit outside the field in `label-sm` style.
- **Chips/Badges:** Soft background tints of the semantic colors (e.g., 10% opacity Emerald for "In Stock") with high-contrast text.
- **Cards:** White background, 1px border, and 12px corner radius. Padding within cards should be a consistent 24px (md) to provide internal whitespace.
- **Navigation:** A persistent sidebar with minimalist line icons (2px stroke). Active states are indicated by a vertical 4px blue "pill" on the leading edge.