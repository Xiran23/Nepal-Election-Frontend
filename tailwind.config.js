/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: '1rem',
    },
    extend: {
      colors: {
        nepalBlue: "#003893",
        nepalRed: '#DC143C',
        primary: '#003893',
        secondary: '#DC143C',
        accent: '#FFD700',
      },
      fontFamily: {
        sans: ['Funnel Sans', 'Inter', 'sans-serif'],
        nepali: ['Mukta', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}