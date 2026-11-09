/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F5F6FA',
        surface: '#FFFFFF',
        sidebar: {
          DEFAULT: '#1E1B4B',
          hover: '#292569',
          active: '#312E81',
          text: '#FFFFFF',
          muted: '#A5B4FC',
        },
        border: {
          DEFAULT: '#E8EAF0',
          subtle: '#F1F2F6',
          strong: '#D2D5E0',
        },
        primary: {
          DEFAULT: '#111827',
          secondary: '#6B7280',
          muted: '#9CA3AF',
        },
        // Deep Indigo brand colour
        brand: {
          DEFAULT: '#3F3DDB',
          hover: '#3230C8',
          light: '#EEF0FD',
          border: '#D8DAFA',
        },
        // Teal secondary accent
        tealAccent: {
          DEFAULT: '#0EA5A4',
          hover: '#0D9488',
          light: '#E6F7F7',
          border: '#B2EBEB',
        },
        // Status soft pills
        status: {
          safe: {
            text: '#15803D',
            bg: '#E8F7EE',
            border: '#C6F0D4',
          },
          caution: {
            text: '#B45309',
            bg: '#FFF4DB',
            border: '#FFE5A3',
          },
          danger: {
            text: '#B42318',
            bg: '#FDECEA',
            border: '#FAC7C3',
          },
          neutral: {
            text: '#4B5563',
            bg: '#F3F4F6',
            border: '#E5E7EB',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        card: '14px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,40,0.05), 0 4px 12px rgba(16,24,40,0.04)',
        'card-hover': '0 4px 8px rgba(16,24,40,0.06), 0 12px 20px rgba(16,24,40,0.06)',
      },
      transitionDuration: {
        DEFAULT: '180ms',
      },
    },
  },
  plugins: [],
}
