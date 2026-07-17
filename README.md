# The Fenômeno — NBA Career

Jogo de carreira estilo *The Fenômeno* ambientado na NBA.

## Stack

- React 19 + Vite
- Tailwind CSS (light mode / dashboard NBA)
- Zustand (estado global)

## Estrutura

```
src/
  data/constants.js   # Atributos, carreira, arquétipos, times
  store/useGameStore.js
  components/         # Dashboard UI
  engine/             # Lógica de simulação
```

## Como rodar

```bash
npm install
npm run dev
```

## Estado do jogo (Zustand)

- `playerStats` — Físico, Arremesso, Defesa, Inteligência
- `careerVariables` — Energia, Dinheiro, Fama, Química
- `currentWeek` / `currentTeam`
- `advanceWeek()` / `updateStat()`
