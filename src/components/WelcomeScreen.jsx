export default function WelcomeScreen({ onEnter }) {
  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-dark-bg font-body text-slate-200">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 55% at 50% 20%, rgba(46,196,182,0.18), transparent 60%), radial-gradient(ellipse 50% 40% at 90% 80%, rgba(224,122,95,0.14), transparent 55%), radial-gradient(ellipse 40% 35% at 10% 70%, rgba(245,183,49,0.08), transparent 50%)',
        }}
      />

      <div className="kh-court-pattern pointer-events-none absolute inset-0 opacity-[0.07]" />

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="kh-brand-enter mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-kings-green to-kings-gold font-display text-4xl font-black text-dark-bg shadow-pf-lg ring-2 ring-kings-gold/40">
          KH
        </div>

        <h1 className="kh-title-enter font-display text-6xl font-extrabold tracking-[0.14em] sm:text-7xl md:text-8xl">
          <span className="text-kings-green">KINGS</span>
          <span className="text-court-orange">HOOP</span>
        </h1>

        <p className="kh-fade-enter mt-4 max-w-md text-sm leading-relaxed text-slate-400 sm:text-base">
          Simulador ao vivo no espírito Kings League — draft, táticas, cartas
          secretas e o caos da quadra.
        </p>

        <button
          type="button"
          onClick={onEnter}
          className="kh-btn-primary kh-fade-enter mt-10 rounded-xl px-10 py-3.5 text-sm font-black uppercase tracking-[0.2em]"
        >
          Entrar no Vestiário
        </button>
      </main>

      <footer className="relative z-10 pb-6 text-center text-[10px] uppercase tracking-[0.2em] text-slate-500">
        Escalada · Presidente · Dado do Caos · Matchball
      </footer>
    </div>
  )
}
