import { useState } from 'react'
import CourtView from './components/CourtView'
import Header from './components/Header'
import LineupPanel from './components/LineupPanel'
import MatchSimulator from './components/MatchSimulator'
import TacticsPanel from './components/TacticsPanel'
import WelcomeScreen from './components/WelcomeScreen'
import { GameProvider } from './context/GameContext'
import { useGame } from './hooks/useGame'

function LockerRoom() {
  const {
    gameStarted,
    homeLineup,
    awayLineup,
    homePresident,
    selectedCard,
    matchKey,
    formation,
    playstyle,
    updateScores,
    setActivePositions,
    setGamePhase,
    handleMatchEnd,
    voltarAoVestiario,
  } = useGame()

  return (
    <div className="flex h-screen w-screen select-none flex-col overflow-hidden bg-dark-bg font-body text-slate-300">
      <Header />

      <main className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <TacticsPanel />

        <section className="flex h-full min-w-0 flex-1 flex-col justify-between p-4 sm:p-5 lg:w-1/2">
          <CourtView />

          <div className="min-h-[50%] flex-1 pt-4">
            {gameStarted ? (
              <MatchSimulator
                key={matchKey}
                homeLineup={homeLineup}
                awayLineup={awayLineup}
                homePresident={homePresident}
                activeCard={selectedCard}
                formation={formation}
                playstyle={playstyle}
                onScoreUpdate={updateScores}
                onActiveChange={setActivePositions}
                onPhaseChange={setGamePhase}
                onMatchEnd={handleMatchEnd}
                onRequestRematch={voltarAoVestiario}
              />
            ) : (
              <div className="kh-panel flex h-full flex-col items-center justify-center p-6 text-center">
                <h3 className="mb-1 font-display text-2xl font-bold tracking-wide text-kings-green">
                  Simulador de Partida
                </h3>
                <p className="max-w-xs text-xs leading-relaxed text-slate-400">
                  Defina as táticas, escolha uma carta secreta e aperte Iniciar
                  Partida para o tip-off.
                </p>
              </div>
            )}
          </div>
        </section>

        <LineupPanel />
      </main>
    </div>
  )
}

export default function App() {
  const [entered, setEntered] = useState(false)

  if (!entered) {
    return <WelcomeScreen onEnter={() => setEntered(true)} />
  }

  return (
    <GameProvider>
      <LockerRoom />
    </GameProvider>
  )
}
