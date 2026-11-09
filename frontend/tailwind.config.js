/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0B1220',
        surface: {
          DEFAULT: '#111A2E',
          hover: '#142038',
        },
        elevated: {
          DEFAULT: '#16213A',
          hover: '#1D2B4C',
        },
        border: {
          DEFAULT: '#22304D',
          subtle: '#1C2942',
          focus: '#3B82F6',
        },
        primary: {
          DEFAULT: '#E6ECF8',
          muted: '#8FA0C0',
          dark: '#5B6F96',
        },
        // Accents
        navy: {
          950: '#0B1220',
          900: '#111A2E',
          800: '#16213A',
          700: '#22304D',
          600: '#33486F',
        },
        accent: {
          blue: '#3B82F6',
          teal: '#14B8A6',
          green: '#22C55E',
          amber: '#F59E0B',
          red: '#EF4444',
        },
        // Risk status colors
        risk: {
          safe: {
            DEFAULT: '#22C55E',
            bg: 'rgba(34, 197, 94, 0.12)',
            border: 'rgba(34, 197, 94, 0.3)',
            text: '#4ADE80',
          },
          caution: {
            DEFAULT: '#F59E0B',
            bg: 'rgba(245, 158, 11, 0.12)',
            border: 'rgba(245, 158, 11, 0.3)',
            text: '#FBBF24',
          },
          high: {
            DEFAULT: '#EF4444',
            bg: 'rgba(239, 68, 68, 0.12)',
            border: 'rgba(239, 68, 68, 0.3)',
            text: '#F87171',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'glow-blue': '0 0 25px -5px rgba(59, 130, 246, 0.25)',
        'glow-teal': '0 0 25px -5px rgba(20, 184, 166, 0.25)',
        'glow-green': '0 0 25px -5px rgba(34, 197, 94, 0.25)',
        'glow-amber': '0 0 25px -5px rgba(245, 158, 11, 0.25)',
        'glow-red': '0 0 25px -5px rgba(239, 68, 68, 0.25)',
        'card-hover': '0 8px 30px rgba(0, 0, 0, 0.35), 0 0 15px rgba(59, 130, 246, 0.1)',
      },
    },
  },
  plugins: [],
}

