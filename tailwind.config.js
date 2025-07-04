import plugin from 'tailwindcss/plugin'

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,js,vue}'],
  theme: {
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        background: {
          DEFAULT: 'hsl(var(--background))',
          1: 'hsl(var(--background-1))',
          inverted: 'hsl(var(--background-inverted))',
        },
        foreground: {
          DEFAULT: 'hsl(var(--foreground))',
          1: 'hsl(var(--foreground-1))',
          2: 'hsl(var(--foreground-2))',
          5: 'hsl(var(--foreground-5))',
          inverted: 'hsl(var(--foreground-inverted))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
        surface: {
          1: {
            DEFAULT: 'hsl(var(--surface-1))',
            hover: 'hsl(var(--surface-1-hover))',
          },
          2: 'hsl(var(--surface-2))',
          3: 'hsl(var(--surface-3))',
        },
        alpha: {
          5: 'hsl(var(--alpha-5))',
          10: 'hsl(var(--alpha-10))',
        },
        stroke: {
          DEFAULT: 'hsl(var(--stroke))',
          1: 'hsl(var(--stroke-1))',
        },
        gray: {
          background: {
            3: 'hsl(var(--gray-background-3))',
          },
        },
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--reka-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--reka-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },

  plugins: [
    require('tailwindcss-animate'),
    plugin(function ({ addUtilities }) {
      addUtilities({
        '.flex-center': {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
        '.flex-col-center': {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        },
        '.flex-between': {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        '.flex-start': {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
        },
        '.mask': {
          position: 'absolute',
          left: 0,
          top: 0,
          right: 0,
          bottom: 0,
        },
        '.shadow-none': {
          boxShadow: 'none',
        },
      })
    }),
  ],
}
