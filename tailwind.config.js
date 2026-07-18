/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0c2340',
          hover: '#163556',
          soft: '#1e3a5f',
        },
        accent: {
          DEFAULT: '#2563eb',
          soft: '#dbeafe',
          muted: '#93c5fd',
        },
        ink: '#0a0a0a',
        ice: '#f8fafc',
        court: '#c8102e',
      },
      fontFamily: {
        display: ['Oswald', 'Segoe UI', 'sans-serif'],
        body: ['DM Sans', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 16px rgba(15, 23, 42, 0.04)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'bar-in': {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.45s ease-out both',
        'bar-in': 'bar-in 0.55s ease-out both',
      },
    },
  },
  plugins: [],
}
