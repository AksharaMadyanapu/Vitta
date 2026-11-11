/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#FBF7F0',
        sand: '#F1E9DC',
        ink: {
          DEFAULT: '#0F3D33',
          light: '#28584E',
          muted: '#527A71',
        },
        mint: {
          DEFAULT: '#CDEBDD',
          dark: '#1C6B56',
          light: '#EAF7F1',
        },
        butter: {
          DEFAULT: '#FFE8A3',
          dark: '#8A5B00',
          light: '#FFF6D6',
        },
        coral: {
          DEFAULT: '#FF6B4A',
          hover: '#E85535',
          light: '#FDEEE9',
          dark: '#B83216',
        },
        surface: '#FFFFFF',
        sidebar: {
          DEFAULT: '#0F3D33',
          hover: '#194E42',
          active: '#FBF7F0',
          text: '#FBF7F0',
          muted: '#8FB4AC',
        },
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Fraunces', 'Georgia', 'serif'],
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '24px',
        card: '24px',
      },
      boxShadow: {
        soft: '0 2px 8px rgba(15, 61, 51, 0.04), 0 8px 24px rgba(15, 61, 51, 0.05)',
        'soft-hover': '0 4px 12px rgba(15, 61, 51, 0.08), 0 16px 32px rgba(15, 61, 51, 0.08)',
        card: '0 2px 8px rgba(15, 61, 51, 0.04), 0 8px 24px rgba(15, 61, 51, 0.05)',
        'card-hover': '0 4px 12px rgba(15, 61, 51, 0.08), 0 16px 32px rgba(15, 61, 51, 0.08)',
      },
      transitionDuration: {
        DEFAULT: '250ms',
      },
    },
  },
  plugins: [],
}
