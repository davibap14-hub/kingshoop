/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0b1f33',
          hover: '#14304c',
          soft: '#1a3a5c',
        },
        accent: {
          DEFAULT: '#1d6fea',
          soft: '#e8f1fd',
          muted: '#7eb0f5',
        },
        ink: '#0c1220',
        ice: '#f4f7fb',
        court: '#c8102e',
        sand: '#e8a317',
      },
      fontFamily: {
        display: ['"Barlow Condensed"', 'Segoe UI', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        panel:
          '0 1px 2px rgba(12, 18, 32, 0.04), 0 8px 24px rgba(12, 18, 32, 0.05)',
        soft: '0 1px 1px rgba(12, 18, 32, 0.03), 0 6px 18px rgba(12, 18, 32, 0.04)',
        lift: '0 2px 4px rgba(12, 18, 32, 0.04), 0 12px 32px rgba(12, 18, 32, 0.06)',
        'lift-lg':
          '0 4px 8px rgba(12, 18, 32, 0.05), 0 20px 40px rgba(12, 18, 32, 0.08)',
        glass: '0 8px 32px rgba(12, 18, 32, 0.06)',
        hero: '0 16px 48px rgba(11, 31, 51, 0.28)',
      },
      borderRadius: {
        '2xl': '1.1rem',
        '3xl': '1.5rem',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        rise: {
          '0%': { opacity: '0', transform: 'translateY(16px) scale(0.985)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'bar-in': {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
        'soft-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateX(-8px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.45s cubic-bezier(0.22, 1, 0.36, 1) both',
        rise: 'rise 0.55s cubic-bezier(0.22, 1, 0.36, 1) both',
        'bar-in': 'bar-in 0.55s cubic-bezier(0.22, 1, 0.36, 1) both',
        'soft-pulse': 'soft-pulse 2s ease-in-out infinite',
        'slide-in': 'slide-in 0.35s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
      transitionTimingFunction: {
        sport: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
}
