/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nepalBlue: "#003893",
        nepalRed: '#DC143C',
        primary: '#003893',
        secondary: '#DC143C',
        accent: '#FFD700',
      }
    },
  },
  plugins: [],
}