/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        orange: { 50: '#FFF7ED', 500: '#F97316' },
        green: { 50: '#ECFDF5', 500: '#10B981' },
        yellow: { 50: '#FFFBEB', 500: '#F59E0B' },
        red: { 50: '#FEF2F2', 500: '#EF4444' },
        blue: { 50: '#EFF6FF', 500: '#3B82F6' },
      },
    },
  },
  plugins: [],
}
