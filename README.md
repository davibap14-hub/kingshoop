# The Fenômeno — NBA Career

Jogo de carreira estilo *The Fenômeno* ambientado na NBA.

## Arquitetura

Separação rígida em três camadas:

| Camada | Pastas | Pode depender de |
| --- | --- | --- |
| **Interface** | `components/`, `pages/`, `layouts/`, `hooks/`, `assets/` | Store, Services, Data (leitura) |
| **Orquestração** | `store/`, `services/` | Engine, Data |
| **Engine** | `engine/` | Apenas `data/` e a própria engine |
| **Dados** | `data/` | Nada (catálogos puros) |

```
Interface  →  services/store  →  Engine  →  Data
```

**A Engine nunca importa React, components, pages, layouts, hooks ou store.**

### Estrutura

```
src/
 ├── components/     # UI reutilizável
 ├── pages/          # Rotas / telas
 ├── layouts/        # Shell da aplicação
 ├── engine/
 │    ├── simulation/
 │    ├── career/
 │    ├── match/
 │    ├── progression/
 │    ├── ai/
 │    └── utils/
 ├── data/
 │    ├── players/
 │    ├── teams/
 │    ├── events/
 │    ├── coaches/
 │    └── constants/
 ├── store/          # Zustand (estado da UI)
 ├── hooks/
 ├── services/       # Fachada Interface → Engine
 └── assets/
```

## Event Engine

`src/engine/events/` + `src/data/events/catalog.js` (80 eventos).

Cada evento: `id`, `categoria`, `peso`, `probabilidade`, `condicoes`, `efeitos`, `texto`, `escolhas` (2–4).

```js
import { rollEvent, resolveEventChoice, triggerEvent } from './engine'

const event = rollEvent(state)
const result = resolveEventChoice(state, event.id, 'a')
// result.effects.deltas → mudanças na carreira
```

Categorias: Treino, Família, Dinheiro, Mídia, Companheiros, Lesões, Treinador, Patrocínio, NBA, Torcedores.

## Career Engine

`src/engine/career/` — uma atividade por semana; retorna efeitos para a Interface.

```js
import { runCareerWeek, startCareer } from './engine'

const { state, availableActivities } = startCareer()
const result = runCareerWeek(state, 'train_arremesso')
// result.effects → deltas, messages, injury, finance…
// result.nextState → aplicar no store
```

Controla: treinos, descanso, lesões, contratos, salário, patrocínios,
popularidade, relação com treinador/companheiros, energia e motivação.


`src/data/players/` — 40 jogadores fictícios com atributos detalhados.

```js
import { playerDb } from './data/players'

playerDb.getAll()
playerDb.getById('pl_009')
playerDb.query({ posicao: 'PG', minOverall: 75 })
playerDb.getTop(10)
```

Cada jogador: `id`, `nome`, `idade`, `posicao`, `overall`, grupos **Físico / Arremesso / Defesa / QI**, `potencial`, `popularidade`, `arquetipo`, `valorMercado`, `salario`.

## Stack

- React 19 + Vite + React Router
- Tailwind CSS (light mode / dashboard NBA)
- Zustand

## Scripts

```bash
npm install
npm run dev
npm run build
npm run lint
```
