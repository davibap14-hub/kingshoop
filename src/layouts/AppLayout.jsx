import { Link } from 'react-router-dom'

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-ice text-slate-800">
      <header className="border-b border-slate-200/90 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3 no-underline">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy font-display text-sm font-black tracking-wide text-white">
              TF
            </div>
            <div>
              <h1 className="font-display text-xl font-extrabold tracking-[0.08em] text-navy sm:text-2xl">
                THE FENÔMENO
              </h1>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-court">
                NBA Career Mode
              </p>
            </div>
          </Link>

          <nav className="flex items-center gap-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <Link to="/" className="transition hover:text-navy">
              Carreira
            </Link>
            <Link to="/match" className="transition hover:text-navy">
              Partida
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  )
}
