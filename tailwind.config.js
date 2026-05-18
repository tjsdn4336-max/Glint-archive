/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          300: '#e8d5a3',
          400: '#c8a96e',
          500: '#a8843a',
          600: '#7d6228',
        },
        surface: {
          950: '#080808',
          900: '#0f0f0f',
          800: '#161616',
          700: '#1e1e1e',
          600: '#272727',
          500: '#323232',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      gridTemplateColumns: {
        'auto-fill-card': 'repeat(auto-fill, minmax(320px, 1fr))',
      },
    },
  },
  plugins: [],
}
