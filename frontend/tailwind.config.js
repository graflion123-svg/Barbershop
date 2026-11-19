/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fdfbf0',
          100: '#fbf6dc',
          200: '#f5eab5',
          300: '#edd884',
          400: '#e3be4e',
          500: '#d4af37', // Classic metallic gold
          600: '#b89028',
          700: '#946e21',
          800: '#795720',
          900: '#674820',
          DEFAULT: '#d4af37',
        },
        charcoal: {
          700: '#2a2e39',
          800: '#1a1d24',
          850: '#14171d',
          900: '#0e1015',
          950: '#07080a',
        }
      },
      fontFamily: {
        serif: ['Cinzel', 'Playfair Display', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'gold-glow': '0 0 25px -5px rgba(212, 175, 55, 0.25)',
        'gold-glow-lg': '0 0 45px -5px rgba(212, 175, 55, 0.35)',
      }
    },
  },
  plugins: [],
}
