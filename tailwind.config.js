module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7e7',
          100: '#fdecc3',
          200: '#fce09f',
          300: '#fbd47b',
          400: '#fac857',
          500: '#f9bc33',
          600: '#e5a820',
          700: '#c18f1b',
          800: '#9d7516',
          900: '#795b11',
        },
        accent: {
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
        }
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}