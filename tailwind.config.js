/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./js/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#121212',
        secondary: '#03fc90',
        accent: '#fc03f8',
        dark: {
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'sans-serif'],
        chinese: ['Microsoft YaHei', 'SimHei', 'sans-serif']
      }
    },
  },
  plugins: [],
  darkMode: 'class'
}