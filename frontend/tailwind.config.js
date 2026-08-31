/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ===== Florist Design System — Botanical Brand Green =====
        // The primary accent of the design language.
        brand: {
          50:  '#e0f5e5',
          100: '#bfe8ca',
          200: '#9fd0b4',
          300: '#7fb89e',
          400: '#5fa088',
          500: '#408872', /* Brand Core */
          600: '#367461',
          700: '#2d6150',
          800: '#234d3f',
          900: '#1a3a2e', /* Deep Forest */
        },

        // ===== Florist Design System — Botanical Earth =====
        // Warm, organic secondary accents.
        earth: {
          clay: '#c89b7b',
          sand: '#e5d4c1',
          moss: '#7a8b6f',
          bark: '#6b5b4f',
        },

        // ===== Florist Design System — Neutrals =====
        neutral: {
          50:  '#fafafa',
          100: '#f5f5f5',
          200: '#e8e8e8',
          300: '#cfcfcf',
          400: '#adadad',
          500: '#8c8c8c',
          600: '#6b6b6b',
          700: '#424242',
          800: '#2e2e2e',
          900: '#1a1a1a',
        },

        // ===== Legacy aliases — remapped to FDS tokens =====
        // `ink-*` was the editorial luxury near-black scale; now it
        // resolves to the FDS neutral scale so existing `ink-900`
        // buttons, borders, and text pick up the new grays automatically.
        ink: {
          50:  '#fafafa',
          100: '#f5f5f5',
          200: '#e8e8e8',
          300: '#cfcfcf',
          400: '#adadad',
          500: '#8c8c8c',
          600: '#6b6b6b',
          700: '#424242',
          800: '#2e2e2e',
          900: '#1a1a1a',
        },

        // `ivory-*` was the warm cream scale; now it resolves to the
        // soft FDS surfaces (neutral 50/100 + earth-sand for warmth).
        ivory: {
          50:  '#fafafa',
          100: '#f5f5f5',
          200: '#e5d4c1', /* earth-sand — warm card/border tone */
          300: '#cfcfcf',
        },

        // `sage-*` was the botanical sage accent; now it points at the
        // FDS brand-green scale so all `bg-sage-*`, `text-sage-*`, and
        // `border-sage-*` classes inherit the FDS botanical green.
        sage: {
          50:  '#e0f5e5',
          100: '#bfe8ca',
          200: '#9fd0b4',
          300: '#7fb89e',
          400: '#5fa088',
          500: '#408872',
          600: '#367461',
          700: '#2d6150',
          800: '#234d3f',
          900: '#1a3a2e',
        },

        // Legacy `primary-*` palette — remapped to FDS brand green.
        primary: {
          50:  '#e0f5e5',
          100: '#bfe8ca',
          200: '#9fd0b4',
          300: '#7fb89e',
          400: '#5fa088',
          500: '#408872',
          600: '#367461',
          700: '#2d6150',
          800: '#234d3f',
          900: '#1a3a2e',
        },
      },
      fontFamily: {
        // Editorial display + clean sans
        display: ['"Cormorant Garamond"', 'serif'],
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Inter"', '"Be Vietnam Pro"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      letterSpacing: {
        editorial: '0.15em',
        widest: '0.25em',
      },
      fontSize: {
        'display-2xl': ['clamp(3.5rem, 7vw, 6rem)', { lineHeight: '0.95', letterSpacing: '-0.02em' }],
        'display-xl': ['clamp(2.75rem, 5vw, 4.5rem)', { lineHeight: '1', letterSpacing: '-0.02em' }],
        'display-lg': ['clamp(2rem, 4vw, 3.25rem)', { lineHeight: '1.05', letterSpacing: '-0.01em' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      borderRadius: {
        'none': '0',
        'xs': '2px',
      },
      boxShadow: {
        // Shadows re-tinted with the FDS brand-green primary so any
        // elevated surface picks up the botanical accent.
        'soft':     '0 1px 2px rgba(26, 58, 46, 0.04)',
        'medium':   '0 4px 24px rgba(26, 58, 46, 0.06)',
        'elevated': '0 12px 40px rgba(26, 58, 46, 0.08)',
      },
      animation: {
        'fade-up': 'fadeUp 0.8s ease-out forwards',
        'fade-in': 'fadeIn 1s ease-out forwards',
        'marquee': 'marquee 40s linear infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'slide-in-right': 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
