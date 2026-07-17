# KingsHoop

Simulador de basquete ao vivo no espírito **Kings League**: draft automático, táticas, cartas secretas e regras especiais em tempo real.

## Como jogar

1. Entre no **Vestiário**
2. Clique em **Revelar Elenco / Draft Auto** para montar os times
3. Ajuste **formação**, **estilo de jogo** e a **carta secreta**
4. **Iniciar Partida** → **Dar o Tip-Off**

### Regras especiais

| Momento | O que acontece |
| --- | --- |
| 1º quarto | Escalada 1v1 → 2v2 → 3v3 → 4v4 → 5v5 |
| Intervalo | Arremesso do Presidente (+4 pts se acertar) |
| Q4 2:00 | Dado do Caos (trava o formato 1v1–5v5) |
| Q4 1:00 | Matchball se a diferença for ≤ 8 pontos |

### Cartas secretas

- **Linha de 4 Pontos** — 3s viram 4 no 2º quarto
- **Zona Trancada** — defesa ×1.25 no 3º quarto
- **Posse do Craque** — o maior OVR finaliza mais no 1º quarto
- **Energia do Banco** — quem entra ganha +10 OVR

## Stack

- React 19 + Vite
- Tailwind CSS
- Motor tático em `src/lib/tactics.js`

## Estrutura

```
src/
  App.jsx                 # Welcome → Vestiário
  context/GameContext.jsx # Estado global do jogo
  hooks/useMatchEngine.js # Loop de simulação ao vivo
  lib/draft.js            # Draft automático
  lib/tactics.js          # Ratings, química, fit
  data/players.js         # Elenco + presidentes
  data/cards.js           # Cartas secretas
  components/             # UI (quadra, táticas, sim, modais)
```

## Scripts

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run lint
npm run preview
```
