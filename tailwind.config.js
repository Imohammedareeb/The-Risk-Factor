/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── Light surface stack ──────────────────────────
        'surface':                  '#fbf9f8',
        'surface-bright':           '#fbf9f8',
        'surface-dim':              '#dcd9d9',
        'surface-container-lowest': '#ffffff',
        'surface-container-low':    '#f6f3f2',
        'surface-container':        '#f0eded',
        'surface-container-high':   '#eae8e7',
        'surface-container-highest':'#e4e2e1',
        'surface-variant':          '#e4e2e1',

        // ── Dark surface stack ───────────────────────────
        'dark-surface':                  '#101314',
        'dark-surface-container-lowest': '#0c0f10',
        'dark-surface-container-low':    '#191c1e',
        'dark-surface-container':        '#1d2022',
        'dark-surface-container-high':   '#272b2d',
        'dark-surface-container-highest':'#323638',

        // ── Brand / Primary ──────────────────────────────
        'primary':           '#00003c',
        'primary-container': '#000080',
        'primary-fixed':     '#e0e0ff',
        'primary-fixed-dim': '#bfc2ff',
        'inverse-primary':   '#bfc2ff',
        'on-primary':        '#ffffff',
        'on-primary-container': '#777eea',
        'on-primary-fixed':     '#00006e',
        'on-primary-fixed-variant': '#3239a3',
        'surface-tint':      '#4b53bc',

        // ── Secondary ────────────────────────────────────
        'secondary':           '#50606f',
        'secondary-container': '#d1e1f4',
        'secondary-fixed':     '#d4e4f6',
        'secondary-fixed-dim': '#b8c8da',
        'on-secondary':        '#ffffff',
        'on-secondary-container': '#556474',
        'on-secondary-fixed':     '#0d1d2a',
        'on-secondary-fixed-variant': '#394857',

        // ── Tertiary (danger / error echo) ───────────────
        'tertiary':           '#220000',
        'tertiary-container': '#4d0000',
        'tertiary-fixed':     '#ffdad4',
        'tertiary-fixed-dim': '#ffb4a8',
        'on-tertiary':        '#ffffff',
        'on-tertiary-container': '#d96756',
        'on-tertiary-fixed':     '#410000',
        'on-tertiary-fixed-variant': '#82271c',

        // ── Error ────────────────────────────────────────
        'error':           '#ba1a1a',
        'error-container': '#ffdad6',
        'on-error':        '#ffffff',
        'on-error-container': '#93000a',

        // ── Neutral text / outline ───────────────────────
        'on-surface':         '#1b1c1c',
        'on-surface-variant': '#464653',
        'on-background':      '#1b1c1c',
        'outline':            '#767684',
        'outline-variant':    '#c6c5d5',
        'inverse-surface':    '#303030',
        'inverse-on-surface': '#f3f0f0',

        // ── Dark-mode text overrides ─────────────────────
        'dark-on-surface':         '#e2e2e5',
        'dark-on-surface-variant': '#c5c4cf',
        'dark-outline':            '#8f8f9d',
        'dark-outline-variant':    '#46464f',
      },
      fontFamily: {
        headline: ['Plus Jakarta Sans', 'sans-serif'],
        body:     ['Inter', 'sans-serif'],
        label:    ['Inter', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['3.5rem',  { lineHeight: '0.95', letterSpacing: '-0.03em', fontWeight: '800' }],
        'display-md': ['2.5rem',  { lineHeight: '1',    letterSpacing: '-0.025em', fontWeight: '700' }],
        'headline-lg': ['2rem',   { lineHeight: '1.1',  letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-md': ['1.75rem',{ lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-sm': ['1.375rem',{ lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
        'title-lg': ['1.125rem', { lineHeight: '1.4',  fontWeight: '600' }],
        'title-md': ['1rem',     { lineHeight: '1.4',  fontWeight: '600' }],
        'body-lg':  ['1rem',     { lineHeight: '1.6',  fontWeight: '400' }],
        'body-md':  ['0.875rem', { lineHeight: '1.6',  fontWeight: '400' }],
        'body-sm':  ['0.75rem',  { lineHeight: '1.5',  fontWeight: '400' }],
        'label-lg': ['0.875rem', { lineHeight: '1.4',  fontWeight: '500', letterSpacing: '0.025em' }],
        'label-md': ['0.75rem',  { lineHeight: '1.4',  fontWeight: '500', letterSpacing: '0.04em' }],
        'label-sm': ['0.6875rem',{ lineHeight: '1.3',  fontWeight: '500', letterSpacing: '0.05em' }],
      },
      borderRadius: {
        DEFAULT: '0.125rem',
        sm:  '0.25rem',
        md:  '0.375rem',
        lg:  '0.75rem',
        xl:  '1rem',
        '2xl': '1.5rem',
        full: '9999px',
      },
      boxShadow: {
        'ambient':    '0px 24px 48px rgba(0, 0, 60, 0.06)',
        'ambient-md': '0px 12px 32px rgba(0, 0, 60, 0.08)',
        'ambient-sm': '0px 4px 16px rgba(0, 0, 60, 0.06)',
        'glow-primary': '0 0 32px rgba(0, 0, 128, 0.18)',
      },
      backdropBlur: {
        glass: '24px',
      },
      transitionTimingFunction: {
        'spring':   'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'fluid':    'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
      },
      keyframes: {
        shimmer: {
          '0%':   { transform: 'translateX(-150%) rotate(15deg)' },
          '100%': { transform: 'translateX(250%) rotate(15deg)' },
        },
        countUp: {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeSlideIn: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%':      { transform: 'scale(1.008)' },
        },
        pulseRing: {
          '0%':   { transform: 'scale(0.9)', opacity: '0.7' },
          '70%':  { transform: 'scale(1.15)', opacity: '0' },
          '100%': { transform: 'scale(0.9)', opacity: '0' },
        },
      },
      animation: {
        shimmer:      'shimmer 2.2s infinite',
        countUp:      'countUp 0.5s ease-out forwards',
        fadeSlideIn:  'fadeSlideIn 0.6s ease-out forwards',
        breathe:      'breathe 4s ease-in-out infinite',
        pulseRing:    'pulseRing 2s ease-out infinite',
      },
    },
  },
  plugins: [],
}
