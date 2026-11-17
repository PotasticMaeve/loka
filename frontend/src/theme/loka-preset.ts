/**
 * Loka design tokens.
 *
 * This file is the single source of truth for the product's visual identity.
 * Everything the UI renders (color, radius, focus ring, form field geometry)
 * resolves to a token defined here, so restyling the app never means hunting
 * for hardcoded hex values inside components.
 *
 * Token tiers (same model as the Design Tokens Format Module):
 *   1. primitive — raw palette steps, no meaning attached (blue.600)
 *   2. semantic  — meaning attached (primary.color, surface.200, focus.ring)
 *   3. component — per component overrides (button.root, card.body)
 *
 * Rule of thumb: prefer semantic overrides. Reach for component tokens only
 * when one component genuinely needs to differ from the shared language.
 *
 * Palette borrowed from a risograph-inspired system: cream paper, ink text,
 * one electric blue for action, lime for emphasis, coral for destructive.
 */
import Aura from '@openvue/themes/aura'
import { definePreset } from '@openvue/themes'

export const brandPalette = {
  50: '#f5f3ff',
  100: '#ede9fe',
  200: '#ddd6fe',
  300: '#c4b5fd',
  400: '#a78bfa',
  500: '#8b5cf6',
  600: '#7c3aed',
  700: '#6d28d9',
  800: '#5b21b6',
  900: '#4c1d95',
  950: '#2e1065',
} as const

/** Warm neutrals: cream paper at the light end, ink at the dark end. */
const surfaceLight = {
  0: '#ffffff',
  50: '#faf8ff',
  100: '#f2effc',
  200: '#e4def6',
  300: '#d0c7ea',
  400: '#a99fd0',
  500: '#7b739c',
  600: '#5f5580',
  700: '#443a66',
  800: '#2c2350',
  900: '#1b1035',
  950: '#0f0821',
} as const

const surfaceDark = {
  0: '#0f0821',
  50: '#1b1035',
  100: '#2c2350',
  200: '#443a66',
  300: '#5f5580',
  400: '#7b739c',
  500: '#a99fd0',
  600: '#d0c7ea',
  700: '#e4def6',
  800: '#f2effc',
  900: '#faf8ff',
  950: '#ffffff',
} as const

export const LokaPreset = definePreset(Aura, {
  semantic: {
    primary: brandPalette,

    borderRadius: {
      none: '0',
      xs: '8px',
      sm: '10px',
      md: '14px',
      lg: '20px',
      xl: '26px',
    },

    colorScheme: {
      light: {
        primary: {
          color: '{primary.600}',
          contrastColor: '#ffffff',
          hoverColor: '{primary.700}',
          activeColor: '{primary.800}',
        },
        surface: surfaceLight,
        highlight: {
          background: '{primary.50}',
          focusBackground: '{primary.100}',
          color: '{primary.800}',
          focusColor: '{primary.950}',
        },
        focusRing: {
          width: '3px',
          style: 'solid',
          color: 'rgba(124, 58, 237, 0.30)',
          offset: '2px',
        },
        mask: {
          background: 'rgba(27, 16, 53, 0.55)',
          color: '{surface.200}',
        },
        content: {
          background: '{surface.0}',
          hoverBackground: '{surface.50}',
          borderColor: '{surface.200}',
          color: '{surface.700}',
          hoverColor: '{surface.900}',
        },
        formField: {
          background: '{surface.0}',
          disabledBackground: '{surface.100}',
          filledBackground: '{surface.50}',
          filledFocusBackground: '{surface.0}',
          borderColor: '{surface.200}',
          hoverBorderColor: '{surface.300}',
          focusBorderColor: '{primary.600}',
          color: '{surface.900}',
          disabledColor: '{surface.400}',
          placeholderColor: '{surface.400}',
          iconColor: '{surface.600}',
          shadow: 'none',
          paddingX: '0.9rem',
          paddingY: '0.65rem',
          borderRadius: '{border.radius.md}',
          focusRing: {
            width: '3px',
            style: 'solid',
            color: 'rgba(124, 58, 237, 0.20)',
            offset: '1px',
            shadow: 'none',
          },
          transitionDuration: '0.18s',
        },
        text: {
          color: '{surface.900}',
          hoverColor: '{surface.950}',
          mutedColor: '{surface.600}',
          hoverMutedColor: '{surface.800}',
        },
      },
      dark: {
        primary: {
          color: '{primary.300}',
          contrastColor: '{primary.950}',
          hoverColor: '{primary.200}',
          activeColor: '{primary.100}',
        },
        surface: surfaceDark,
        highlight: {
          background: 'color-mix(in srgb, {primary.500}, transparent 78%)',
          focusBackground: 'color-mix(in srgb, {primary.500}, transparent 66%)',
          color: '{primary.100}',
          focusColor: '{primary.50}',
        },
        content: {
          background: '{surface.100}',
          hoverBackground: '{surface.200}',
          borderColor: '{surface.200}',
          color: '{surface.700}',
          hoverColor: '{surface.900}',
        },
        formField: {
          background: '{surface.50}',
          borderColor: '{surface.200}',
          hoverBorderColor: '{surface.300}',
          focusBorderColor: '{primary.300}',
          color: '{surface.900}',
          placeholderColor: '{surface.500}',
        },
      },
    },
  },

  components: {
    button: {
      root: {
        // Pill buttons are the house shape: every action reads as a lozenge.
        borderRadius: '9999px',
        roundedBorderRadius: '9999px',
        paddingX: '1.1rem',
        paddingY: '0.6rem',
        label: { fontWeight: '700' },
        sm: { paddingX: '0.85rem', paddingY: '0.4rem' },
        lg: { paddingX: '1.5rem', paddingY: '0.8rem' },
      },
    },
    card: {
      root: {
        borderRadius: '{border.radius.xl}',
        shadow: '0 1px 0 #e4def6, 0 24px 48px -34px rgba(27, 16, 53, 0.45)',
      },
      body: { padding: '1.5rem' },
      title: { fontWeight: '700' },
    },
    tag: {
      root: {
        fontSize: '0.75rem',
        fontWeight: '700',
        padding: '0.2rem 0.65rem',
        borderRadius: '9999px',
      },
    },
    datatable: {
      headerCell: {
        background: '{surface.50}',
        color: '{surface.600}',
        fontWeight: '600',
        fontSize: '0.75rem',
        padding: '0.8rem 1rem',
      },
      bodyCell: { padding: '0.9rem 1rem' },
    },
    dialog: {
      root: { borderRadius: '{border.radius.xl}' },
    },
    inputtext: {
      root: { borderRadius: '{border.radius.md}' },
    },
  },
})

export default LokaPreset
