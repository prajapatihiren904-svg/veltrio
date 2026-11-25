/**
 * Tailwind is wired to the design tokens in src/styles/tokens.css.
 *
 * `theme.colors` is REPLACED (not extended), so the default palette
 * (bg-gray-500, text-emerald-400 ...) does not exist. Components can only use
 * the semantic names below, which keeps every color change in tokens.css.
 */
const color = (name) => `rgb(var(--color-${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      canvas: color('canvas'),
      surface: {
        DEFAULT: color('surface'),
        raised: color('surface-raised'),
        overlay: color('surface-overlay'),
      },
      line: {
        DEFAULT: color('line'),
        strong: color('line-strong'),
      },
      content: {
        DEFAULT: color('content'),
        muted: color('content-muted'),
        subtle: color('content-subtle'),
      },
      brand: {
        300: color('brand-300'),
        400: color('brand-400'),
        500: color('brand-500'),
        600: color('brand-600'),
        ink: color('brand-ink'),
      },
      success: color('success'),
      warning: color('warning'),
      danger: color('danger'),
      info: color('info'),
    },
    extend: {
      fontFamily: {
        sans: 'var(--font-sans)',
        display: 'var(--font-display)',
      },
      borderRadius: {
        control: 'var(--radius-control)',
        card: 'var(--radius-card)',
        modal: 'var(--radius-modal)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        overlay: 'var(--shadow-overlay)',
        glow: 'var(--shadow-glow)',
      },
      spacing: {
        sidebar: 'var(--layout-sidebar-width)',
        header: 'var(--layout-header-height)',
      },
      maxWidth: {
        content: 'var(--layout-content-max)',
      },
      transitionTimingFunction: {
        out: 'var(--ease-out)',
      },
      transitionDuration: {
        fast: 'var(--duration-fast)',
        base: 'var(--duration-base)',
        slow: 'var(--duration-slow)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      animation: {
        'fade-in': 'fade-in var(--duration-base) var(--ease-out) both',
        'fade-up': 'fade-up var(--duration-slow) var(--ease-out) both',
        shimmer: 'shimmer 1.8s linear infinite',
      },
    },
  },
  plugins: [],
};
