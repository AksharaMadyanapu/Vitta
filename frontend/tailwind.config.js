/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F7F8FA',
        surface: '#FFFFFF',
        border: {
          DEFAULT: '#E5E7EB',
          subtle: '#F3F4F6',
          strong: '#D1D5DB',
        },
        primary: {
          DEFAULT: '#111827',
          secondary: '#6B7280',
          muted: '#9CA3AF',
        },
        // ONE Accent colour
        accent: {
          DEFAULT: '#2548C9',
          hover: '#1E3EA8',
          light: '#EEF2FF',
          border: '#C7D2FE',
        },
        // Soft status colours (muted pills)
        status: {
          safe: {
            text: '#15803D',
            bg: '#ECFDF3',
            border: '#D1FADF',
          },
          caution: {
            text: '#B45309',
            bg: '#FFFAEB',
            border: '#FEDF89',
          },
          danger: {
            text: '#B42318',
            bg: '#FEF3F2',
            border: '#FECDCA',
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
      },
      borderRadius: {
        card: '10px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      },
      transitionDuration: {
        DEFAULT: '150ms',
      },
    },
  },
  plugins: [],
}
