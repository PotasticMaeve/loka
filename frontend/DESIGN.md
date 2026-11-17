---
version: alpha
name: Loka
description: Single-hue blue system on a cool paper background. Deep gradients for focus surfaces, everything else quiet.
colors:
  primary: "#2B1FE0"
  secondary: "#5A6483"
  tertiary: "#0A1033"
  neutral: "#F3F5FB"
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
    backgroundColor: "#2216B4"
    textColor: "#FFFFFF"
    rounded: "{rounded.full}"
    padding: 12px
  button-on-dark:
    backgroundColor: "#FFFFFF"
    textColor: "#0B0640"
    rounded: "{rounded.full}"
    padding: 13px
  card:
    backgroundColor: "#FFFFFF"
    textColor: "{colors.tertiary}"
    rounded: "{rounded.xl}"
    padding: 24px
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
    backgroundColor: "#DEE3FF"
    textColor: "#140B6B"
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

The system is deliberately single-hue. One blue family carries action,
selection, and emphasis; neutrals carry structure. Depth comes from two
gradients — a deep one for focus surfaces, a pale one for rest — instead of a
rainbow of accent colors.

## Colors

- **Primary (#2B1FE0):** every interactive element. Primary buttons, selected
  slot, active navigation, focus rings.
- **Tertiary (#0A1033):** ink. Headings, body text, and the "void" state
  (cancelled bookings).
- **Secondary (#5A6483):** supporting text, metadata labels, icons.
- **Neutral (#F3F5FB):** cool paper. Page background behind white cards.

Depth comes from gradients, not from new hues:

- `gradient-deep` — `linear-gradient(135deg, #0B0640, #2216B4 48%, #4F4BF5)`.
  Hero panels, the selection summary, auth panels. Text on it is white or
  white/70 at minimum.
- `gradient-pale` — `linear-gradient(180deg, #EEF1FF, #FFFFFF)`. Quiet surface
  washes behind content.
- `text-gradient` — white to #CFD6FF. Display headlines on deep gradients only.

Status uses one hue at three weights: solid blue (confirmed), blue tint
(completed), ink (cancelled). Text always states the status; color only
reinforces it.

## Typography

Bricolage Grotesque for headings at weight 800 with negative tracking; it is
the only place the product raises its voice. DM Sans carries all body copy at
400–700. JetBrains Mono is reserved for numbers that must align, IDs, prices,
time ranges, and uppercase micro-labels.

Fonts are self-hosted from `/fonts` (woff2, latin + latin-ext) so the app never
depends on a third-party font CDN at runtime.

## Layout

Content is capped at 1152px and centered. Cards use 24px internal padding on an
8px spacing scale; page sections are separated by 32–48px. The booking page
splits into choices on the left and a sticky summary on the right at `lg`.

## Elevation & Depth

Two levels only. Flat cards: 1px `#DBE2F3` border, no shadow. Interactive cards
lift 4px on hover with a wide, low-opacity blue shadow. Overlays add a 55% ink
mask.

## Shapes

Buttons and tags are full pills. Inputs and time slots use 14px corners, cards
26px, the hero panel 32px. Nothing is square.

## Components

- **button-primary** is the only high-emphasis action per view.
- **button-on-dark** replaces it on gradient panels: white fill, ink label.
- **card** holds one concept; if it needs an internal divider to make sense, it
  should be two cards.
- **tag-confirmed / tag-completed / tag-cancelled** pair color with a text label
  at all times.
- **slot-available / slot-selected** keep identical geometry so the grid never
  shifts when a slot is picked.

## Do's and Don'ts

- Do keep every surface inside the blue family; add depth with gradients, not
  with a second accent hue.
- Do keep white or white/70 as the minimum text color on deep gradients.
- Do format every price and time through a single formatter.
- Don't put body copy on `gradient-deep` at less than 14px.
- Don't use more than two font weights on one screen.
- Don't introduce a new color for a status that already has one.
- Don't nest a card inside a card to add grouping — change the spacing instead.
