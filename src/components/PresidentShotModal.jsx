export default function PresidentShotModal({
  homePresident,
  presidentShotSuccess,
  onShoot,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-bg/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-kings-green/20 bg-card-dark p-6 text-center shadow-pf-lg">
        <h3 className="mb-2 font-display text-2xl tracking-wide text-kings-green">
          Arremesso do Presidente!
        </h3>
        <p className="mb-6 text-xs leading-relaxed text-slate-400">
          Halftime! {homePresident?.name || 'Seu presidente'} tenta o chute de 4
          pontos do meio da quadra.
        </p>

        {presidentShotSuccess === null ? (
          <button
            type="button"
            onClick={onShoot}
            className="kh-btn-primary w-full rounded-xl py-3 text-xs font-black uppercase tracking-widest"
          >
            Disparar Bola!
          </button>
        ) : (
          <div className="py-2">
            <span
              className={`block text-lg font-bold ${
                presidentShotSuccess ? 'text-kings-green' : 'text-kings-red'
              }`}
            >
              {presidentShotSuccess
                ? 'ACERTOU EM CHEIO! (+4 PTS)'
                : 'NO ARO! Errou o alvo!'}
            </span>
            <span className="mt-1 block text-[10px] text-slate-400">
              Retornando para a quadra em instantes...
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
