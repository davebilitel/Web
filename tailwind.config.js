/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: {
            primary: '#0f172a',
            secondary: '#1e293b',
            tertiary: '#334155',
          },
          text: {
            primary: '#60a5fa',
            secondary: '#93c5fd',
            tertiary: '#bfdbfe',
          }
        },
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      }
    }
  },
  plugins: [],
  darkMode: 'class',
} 