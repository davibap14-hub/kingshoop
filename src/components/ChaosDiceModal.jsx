export default function ChaosDiceModal({ isDiceSpinning, onRoll }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-bg/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-court-orange/30 bg-card-dark p-6 text-center shadow-pf-lg">
        <div
          className={`mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-xl border-2 border-court-orange bg-panel font-display text-3xl text-court-orange ${
            isDiceSpinning ? 'animate-dice-spin' : ''
          }`}
        >
          {isDiceSpinning ? '?' : 'D5'}
        </div>
        <h3 className="mb-2 font-display text-2xl tracking-wide text-court-orange">
          Dado do Caos!
        </h3>
        <p className="mb-6 text-xs leading-relaxed text-slate-400">
          Cronômetro travado aos 2:00 do último quarto. O dado define o formato
          (1v1 a 5v5) até o fim!
        </p>

        <button
          type="button"
          disabled={isDiceSpinning}
          onClick={onRoll}
          className="w-full rounded-xl bg-court-orange py-3 text-xs font-black uppercase tracking-widest text-dark-bg hover:brightness-105 disabled:opacity-50"
        >
          {isDiceSpinning ? 'Sorteando...' : 'Girar o Dado!'}
        </button>
      </div>
    </div>
  )
}
