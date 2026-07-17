/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0c2340',
          hover: '#163556',
        },
        court: '#c8102e',
        ice: '#f4f7fb',
      },
      fontFamily: {
        display: ['Oswald', 'Segoe UI', 'sans-serif'],
        body: ['DM Sans', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
