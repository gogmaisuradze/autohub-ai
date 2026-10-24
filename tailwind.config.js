/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neu: {
          bg: '#ECEAE5',
          card: '#FFFFFF',
          border: '#E2E0DB',
          dark: '#14213D',
        },
        gold: {
          DEFAULT: '#FCA311',
          400: '#fbbf24',
          500: '#FCA311',
          600: '#e58e07',
        },
        navy: {
          DEFAULT: '#14213D',
          900: '#0c1527',
          800: '#14213D',
          700: '#1d2f55',
          600: '#2b4274',
        },
        platinum: {
          DEFAULT: '#E5E5E5',
          light: '#F8FAFC',
          dark: '#CBD5E1'
        }
      },
      fontFamily: {
        sans: ['"FiraGO"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'neu-flat': '8px 8px 20px rgba(163, 177, 198, 0.45), -8px -8px 20px rgba(255, 255, 255, 0.95)',
        'neu-pressed': 'inset 4px 4px 8px rgba(163, 177, 198, 0.5), inset -4px -4px 8px rgba(255, 255, 255, 0.95)',
        'neu-card': '0 12px 30px -6px rgba(20, 33, 61, 0.08), 0 4px 12px -2px rgba(20, 33, 61, 0.04), inset 0 1px 1px 0 rgba(255, 255, 255, 0.95)',
        'neu-circle': '6px 6px 14px rgba(20, 33, 61, 0.08), -6px -6px 14px rgba(255, 255, 255, 0.95)',
        'neu-circle-pressed': 'inset 3px 3px 6px rgba(20, 33, 61, 0.12), inset -3px -3px 6px rgba(255, 255, 255, 0.9)',
        'gold-soft': '0 8px 20px -3px rgba(252, 163, 17, 0.35)',
      }
    },
  },
  plugins: [],
}
