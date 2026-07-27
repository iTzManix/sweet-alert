/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/app/**/*.{js,jsx,ts,tsx}', './src/components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9ebff',
          200: '#bcdcff',
          300: '#8ec4ff',
          400: '#59a3ff',
          500: '#2f7ffb',
          600: '#1c5ff0',
          700: '#1949c9',
          800: '#1a3ea1',
          900: '#1a3980',
        },
        risk: {
          low: '#16a34a',
          moderate: '#d97706',
          high: '#dc2626',
        },
      },
    },
  },
  plugins: [],
};
