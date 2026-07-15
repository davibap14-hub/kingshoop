/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'court-orange': '#e07a5f',
        'kings-green': '#2ec4b6',
        'dark-bg': '#0f172a',
        'card-dark': '#1e293b',
      },
    },
  },
  plugins: [],
}
