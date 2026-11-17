---
version: alpha
name: Loka
description: Single-hue violet system on lavender paper. Depth from tint and shade only — no gradients, no second accent.
colors:
  primary: "#7C3AED"
  secondary: "#5F5580"
  tertiary: "#1B1035"
  neutral: "#F7F5FD"
typography:
  h1:
    fontFamily: Bricolage Grotesque
    fontSize: 3.75rem
    fontWeight: 800
    lineHeight: 0.98
    letterSpacing: "-0.035em"
  h2:
    fontFamily: Bricolage Grotesque
    fontSize: 1.875rem
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  body-md:
    fontFamily: DM Sans
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: DM Sans
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: JetBrains Mono
    fontSize: 0.6875rem
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.08em"
rounded:
  sm: 10px
  md: 14px
  lg: 20px
  xl: 26px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.full}"
    padding: 12px
  button-primary-hover:
    backgroundColor: "#6D28D9"
    textColor: "#FFFFFF"
    rounded: "{rounded.full}"
    padding: 12px
  button-on-dark:
    backgroundColor: "#FFFFFF"
    textColor: "{colors.tertiary}"
    rounded: "{rounded.full}"
    padding: 13px
  card:
    backgroundColor: "#FFFFFF"
    textColor: "{colors.tertiary}"
    rounded: "{rounded.xl}"
    padding: 24px
  panel-deep:
    backgroundColor: "{colors.tertiary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.xl}"
    padding: 32px
  page-surface:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.tertiary}"
    rounded: "{rounded.sm}"
    padding: 32px
  tag-confirmed:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.full}"
    padding: 4px
  tag-completed:
    backgroundColor: "#EDE9FE"
    textColor: "#4C1D95"
    rounded: "{rounded.full}"
    padding: 4px
  tag-cancelled:
    backgroundColor: "{colors.tertiary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.full}"
    padding: 4px
  slot-available:
    backgroundColor: "#FFFFFF"
    textColor: "{colors.tertiary}"
    rounded: "{rounded.md}"
    padding: 12px
  slot-selected:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: 12px
---

# Loka

## Overview

Loka books rooms by the hour. The interface has one job: make "which hours are
free, and what will they cost" obvious in a single glance. Everything else is
quiet.

The system is single-hue by design. One violet family carries action, selection,
and emphasis; a desaturated violet-gray carries structure. Depth is expressed
through **tint and shade of the same hue** — never through a gradient, and never
through a second accent color.

## Colors

- **Primary (#7C3AED):** every interactive element — primary buttons, selected
  slot, active navigation, focus rings.
- **Tertiary (#1B1035):** ink. Headings, body text, deep panels, and the "void"
  state (cancelled bookings).
- **Secondary (#5F5580):** supporting text, metadata labels, icons.
- **Neutral (#F7F5FD):** lavender paper behind white cards.

Depth ladder (what to reach for instead of a gradient):

- **violet-950 (#2E1065)** — deep panels that must dominate the page.
- **violet-600 (#7C3AED)** — primary action and selection.
- **violet-400 (#A78BFA)** — secondary emphasis, accent rules.
- **violet-200 (#DDD6FE)** — quiet emphasis bars on white.
- **violet-50 (#F5F3FF)** — inline chips and hit areas.

Status uses one hue at three weights: solid violet (confirmed), violet tint
(completed), ink (cancelled). The text always states the status; color only
reinforces it.

## Typography

Bricolage Grotesque at 800 for headings with negative tracking; it is the only
place the product raises its voice. DM Sans carries all body copy at 400–700.
JetBrains Mono is reserved for prices, time ranges, IDs, and uppercase
micro-labels.

Fonts are self-hosted from `/fonts` (woff2, latin + latin-ext) so the app never
depends on a third-party font CDN at runtime.

## Layout

Content is capped at 1152px and centered. Cards use 24px internal padding on an
8px scale; page sections are separated by 32–48px. The booking page splits into
choices on the left and a sticky summary on the right at `lg`.

## Elevation & Depth

Two levels. Flat cards: 1px `#E4DEF6` border, no shadow. Interactive cards lift
4px on hover with a wide, low-opacity violet shadow. Overlays add a 55% ink
mask. No element uses a gradient, inner shadow, or glass effect.

## Shapes

Buttons and tags are full pills. Inputs and time slots use 14px corners, cards
26px, deep panels 32px. Nothing is square.

## Components

- **button-primary** is the only high-emphasis action per view.
- **button-on-dark** replaces it on deep panels: white fill, ink label.
- **panel-deep** is a solid violet-950 surface — never a gradient.
- **card** holds one concept; if it needs an internal divider to make sense, it
  should be two cards.
- **tag-confirmed / tag-completed / tag-cancelled** pair color with a text label
  at all times.
- **slot-available / slot-selected** keep identical geometry so the grid never
  shifts when a slot is picked.

## Do's and Don'ts

- Do build depth from tints and shades of violet plus neutral paper.
- Do keep white on violet-600 or darker; white on violet-600 is 5.7:1.
- Do format every price and time through a single formatter.
- Don't use gradients, glows, or glass — they muddy the flat hierarchy.
- Don't introduce a second accent hue for a status that already has one.
- Don't use more than two font weights on one screen.
- Don't nest a card inside a card to add grouping — change the spacing instead.
