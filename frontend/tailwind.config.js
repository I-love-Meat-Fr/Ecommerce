/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
colors: {
        // Editorial Luxury palette — neutral foundations
        ivory: {
          50: '#fdfcf9',
          100: '#f8f5ee',
          200: '#f0eadf',
          300: '#e3dccb',
        },
        ink: {
          900: '#0a0a0a',
          800: '#1a1a1a',
          700: '#2d2d2d',
          600: '#404040',
          500: '#595959',
          400: '#8a8a8a',
          300: '#b8b8b8',
        },
        // Botanical sage — primary natural accent
        sage: {
          50: '#f4f7f1',
          100: '#e6ecdf',
          200: '#cdd9bf',
          300: '#aebf97',
          400: '#7d9463',
          500: '#5e7a48',
          600: '#3f5530',
        },
        // Legacy alias — components still reference `champagne-NNN`.
        // Pointed at the sage palette so the theme reads green/natural.
        champagne: {
          50: '#f4f7f1',
          100: '#e6ecdf',
          200: '#cdd9bf',
          300: '#aebf97',
          400: '#7d9463',
          500: '#5e7a48',
          600: '#3f5530',
        },
        // Legacy primary for compatibility
        primary: {
          50: '#fdfcf9',
          100: '#f8f5ee',
          200: '#f0eadf',
          300: '#e3dccb',
          400: '#a37d35',
          500: '#7a5e26',
          600: '#404040',
          700: '#2d2d2d',
          800: '#1a1a1a',
          900: '#0a0a0a',
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
        'soft': '0 1px 2px rgba(10,10,10,0.04)',
        'medium': '0 4px 24px rgba(10,10,10,0.06)',
        'elevated': '0 12px 40px rgba(10,10,10,0.08)',
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