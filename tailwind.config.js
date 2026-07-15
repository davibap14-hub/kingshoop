/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Pick Five / 4-0-court tokens (espelhados)
        'pf-bg': '#f3f5f9',
        'pf-subtle': '#e8ecf4',
        'pf-surface': '#ffffff',
        'pf-muted': '#f8fafc',
        'nba-navy': '#17408b',
        'nba-navy-hover': '#1e4f9c',
        'nba-red': '#c9082a',
        'nba-gold': '#f5b731',
        'nba-orange': '#ff8c00',
        // aliases legados (apontam para o mesmo visual)
        'court-orange': '#ff8c00',
        'kings-green': '#17408b',
        'dark-bg': '#f3f5f9',
        'card-dark': '#ffffff',
      },
      fontFamily: {
        display: ['"Barlow Condensed"', 'Outfit', 'system-ui', 'sans-serif'],
        body: ['Outfit', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'pf-sm': '0 1px 2px rgba(15,23,42,0.04), 0 2px 6px rgba(15,23,42,0.05)',
        'pf-md':
          '0 4px 6px -1px rgba(15,23,42,0.06), 0 10px 20px -4px rgba(15,23,42,0.08)',
        'pf-lg':
          '0 10px 15px -3px rgba(15,23,42,0.07), 0 20px 36px -8px rgba(15,23,42,0.1)',
        'pf-navy': '0 0 40px rgba(23,64,139,0.15)',
      },
      borderRadius: {
        pf: '14px',
        'pf-lg': '18px',
        'pf-xl': '24px',
      },
    },
  },
  plugins: [],
}
