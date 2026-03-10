/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#FF7521',
          600: '#ea6c1a',
          700: '#c2570e',
          800: '#9a450f',
          900: '#7c3810',
        },
      },
    },
  },
  plugins: [],
}

