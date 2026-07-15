/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Kings League / KingsHoop
        'court-orange': '#e07a5f',
        'kings-green': '#2ec4b6',
        'kings-gold': '#f5b731',
        'kings-red': '#e63946',
        'dark-bg': '#0b1220',
        'card-dark': '#151e2e',
        'panel': '#1a2436',
        // aliases de layout (mesmo tom KL, evita classes NBA)
        'pf-bg': '#0b1220',
        'pf-subtle': '#111827',
        'pf-surface': '#151e2e',
        'pf-muted': '#1a2436',
        'nba-navy': '#2ec4b6',
        'nba-navy-hover': '#3dd9ca',
        'nba-red': '#e63946',
        'nba-gold': '#f5b731',
        'nba-orange': '#e07a5f',
      },
      fontFamily: {
        display: ['"Barlow Condensed"', 'Outfit', 'system-ui', 'sans-serif'],
        body: ['Outfit', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'pf-sm': '0 1px 2px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.25)',
        'pf-md': '0 8px 24px rgba(0,0,0,0.35)',
        'pf-lg': '0 16px 40px rgba(0,0,0,0.45)',
        'pf-navy': '0 0 28px rgba(46,196,182,0.28)',
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
