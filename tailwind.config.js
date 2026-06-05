/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        ui: ['Jost', 'system-ui', 'sans-serif'],
      },
      colors: {
        sand: {
          DEFAULT: '#C9A96E',
          light: '#E8D5B0',
          dark: '#A07840',
        },
        espresso: '#1A0F0A',
        charcoal: '#0F1117',
        sidebar: '#111318',
      },
    },
  },
  plugins: [],
};
