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
 │    ├── draft/
 │    ├── franchise/
 │    ├── news/
 │    ├── history/
 │    ├── balance/
 │    ├── personality/
 │    ├── career/
 │    ├── match/
 │    ├── progression/
 │    ├── ai/
 │    └── utils/
 ├── data/
 │    ├── players/
 │    ├── draft/
 │    ├── franchise/
 │    ├── news/
 │    ├── history/
 │    ├── balance/
 │    ├── personality/
 │    ├── teams/
 │    ├── events/
 │    ├── coaches/
 │    └── constants/
 ├── store/          # Zustand (estado da UI)
 ├── hooks/
 ├── services/       # Fachada Interface → Engine
 └── assets/
```

## Balance Engine

`src/engine/balance/` + `src/data/balance/` — equilíbrio configurável do jogo.

Objetivos (todos via constantes em `data/balance/constants.js`):

- Evitar evolução exagerada (freio de XP por overall/nível/idade)
- Controlar inflação de atributos (diminishing returns + tetos efetivos)
- Controlar contratos (salário por OVR/potencial/idade + inflação da liga)
- Controlar crescimento de rookies (treino/XP e crescimento sazonal)
- Controlar decadência de veteranos (perda anual de atributos)

```js
applyBalancedTrainingGain(prev, rawGain, { player, archetypeId, groupKey })
balanceXpGain(xp, { player, progression })
calcBalancedSalary(player, { seasonNumber, demandFactor })
processSeasonalBalance({ player, gm, seasonRolled, resolvePlayer })
```

UI: `BalancePanel` (tetos ativos). Overrides da liga em `gm.playerOverrides`.

## History Engine

`src/engine/history/` + `src/data/history/` — arquivo permanente da liga.

Salva entre temporadas (nada é descartado):

- Todos os MVPs e premiações
- Campeões
- Estatísticas de cada temporada
- Líderes da liga
- Recordes all-time
- Hall da Fama
- Aposentadorias

No roll de temporada, a Season Engine anterior é arquivada **antes** do reset. O log semanal (`history`, cap 120) é separado de `leagueHistory` (ilimitado).

```js
processWeeklyHistory({ leagueHistory, previousSeason, seasonRolled, weekResults, gmDecisions })
// → { leagueHistory, summary, messages }

getHistoryView(leagueHistory)
```

Persistido no Save System (`SAVE_VERSION` 4). UI: `HistoryPanel`.

## News Engine

`src/engine/news/` — gera notícias automaticamente toda semana.

Categorias: Triple-Double · Recorde · Lesão · Troca · MVP · Críticas · Rumores · Aposentadoria · Draft · Prêmios…

Cada notícia tem **título**, **resumo** e **impacto** (tom, magnitude, deltas opcionais). Usa fatos da Season + GM + Franchise AI.

```js
processWeeklyNews({ week, seasonSummary, gmSummary, ... })
// → { weekNews, newsFeed, deltas, summary }
```

UI: `NewsPanel` no dashboard.

## Franchise AI

`src/engine/franchise/` — cada franquia persegue um objetivo e adapta decisões aos resultados.

Objetivos: **Tank · Playoffs · Título · Desenvolvimento · Economia**

```js
import { resolveFranchiseObjective, decideForFranchise } from './engine'

const goal = resolveFranchiseObjective(gm, 'bos', seasonState)
// goal.objectiveId / reason — muda com win% , OVR, cap, semana
const turn = decideForFranchise(gm, 'bos', seasonState)
// decisões por score — nunca aleatórias
```

A IA reavalia o objetivo toda semana e escolhe sempre a ação de maior score (sign/release/renew/trade/draft).

## Draft Engine

`src/engine/draft/` + `src/data/draft/` — gera a classe de Draft todo ano.

Cada prospect possui: **Potencial, Overall, Idade, Posição, Universidade, Arquétipo, Personalidade, Atributos, Mock Draft**.

```js
import { generateDraftClass, processDraft, getDraftBoard } from './engine'

const board = generateDraftClass(seasonNumber, rng)
const result = processDraft(gm, seasonState, rng)
// times escolhem por necessidade; undrafted entram como FA
```

Fluxo na offseason: semana 44 revela a classe + Mock Draft; semanas 45–46 executam o draft. Após o draft, **todos** entram na liga (elenco ou free agency).

## Personality Engine

`src/engine/personality/` + `src/data/personality/` — traços 0–100 em cada jogador:

**Competitividade · Ego · Liderança · Lealdade · Temperamento · Ambição · Disciplina · Confiança**

Influenciam:
- **Química** do elenco e relações semanais
- **Contratos** (demanda salarial / renovação)
- **Trocas** (disposição a sair)
- **Desenvolvimento** (XP e eficiência de treino)
- **Eventos** (peso, elegibilidade e efeitos das escolhas)
- **Escolhas** semanais (ordem / sugestão de atividades)

```js
import { calcRosterChemistry, trait, sortActivitiesByPersonality } from './engine'

trait(player, 'lealdade') // 0–100
calcRosterChemistry(lineup)
```

Personalidade é derivada no `normalizePlayer` (override manual via `personalidade`).

## General Manager Engine

`src/engine/gm/` — decisões automáticas das franquias.

Personalidades: **Reconstrução · Competitiva · Contender · Jovem · Financeira**

Responsabilidades: contratações, trocas, dispensas, renovações, draft e salary cap.

```js
processWeeklyGm(state, { week, phase, seasonRolled, rng })
// → { gm, decisions, summary, messages }
```

Cada decisão considera a situação da franquia (record, OVR, idade, teto, necessidades).

## Season Engine

`src/engine/season/` — controla a temporada da liga.

- Calendário completo de jogos
- Classificação por conferência (V/D + sequência)
- Lesões na liga
- Simulação dos jogos dos outros times
- Play-In · Playoffs · Finais · Premiações

```js
processWeeklySeason(state, { week, seasonRolled, rng })
// → { season, weekResults, summary, messages }
```

A Interface apenas exibe os dados (`SeasonPanel` / `getSeasonView`).

## Save System

`src/engine/save/` + `src/services/saveService.js` — LocalStorage, múltiplos slots.

Salva: jogador, time, temporada, atributos, eventos, histórico, estatísticas, contratos.

```js
gameService.autoSave(state)   // após cada semana
gameService.createSave(state, 'Minha Carreira')
gameService.loadSave(id)
```

## Interface (Dashboard NBA)

Layout Tailwind: **Sidebar · Header · Área principal**.

Componentes reutilizáveis em `src/components/ui`, `charts` e `dashboard`:

- Cards, métricas, badges, botões, barras de progresso
- Gráficos (barras, linha, radar)
- Status do jogador, próxima partida, calendário da temporada

Paleta: branco, cinza, preto e detalhes em azul (`navy` / `accent`).

## Finance Engine

`src/engine/finance/` — salário, patrocínios, investimentos, gastos, luxo, impostos e patrimônio.

```js
processWeeklyFinance(state, { extraIncome })
// → { deltas, sponsorships, finance, summary, messages }
```

O dinheiro influencia **felicidade** e **popularidade**. Cada semana devolve um resumo financeiro (`summary`).

## Progression Engine

`src/engine/progression/` — XP semanal, level-up e pontos de evolução.

```js
processWeeklyProgression(state, activity)
spendEvolutionPoint(state, 'arremesso')
// nunca ultrapassa caps do arquétipo; +1 gradual no attr mais baixo
```

Grupos: Físico · Arremesso · Defesa · QI

## AI Engine

`src/engine/ai/` — estilos de equipe e decisões automáticas.

Estilos: **Fast Pace · Defensivo · Especialista em 3PT · Garrafão · Transição**

```js
import { chooseBestStyle, simulateMatch, buildDefaultMatchup } from './engine'

const matchup = buildDefaultMatchup('gsw', 'bos')
// cada lado já vem com styleId escolhido pelo elenco
const result = simulateMatch(matchup)
// result.styles.home / result.styles.away
```

A IA altera ritmo, taxa de 3PT/2PT, turnovers, roubos e agressão por posse.

## Simulation Engine

`src/engine/simulation/` — substitui a Match Engine. Simulação **posse a posse** com Play-by-Play completo.

Cada posse modela: Ball Handler, defesa individual, ajuda defensiva, Pick and Roll, Isolation, Drive, Kick Out, Corte, Screen, Post Up, Fast Break e Offensive Rebound — além de finalizações por tendência (Alley Oop, Step Back, Fadeaway).

Cada jogador tem **Tendências** (0–100): Shoot3, Drive, Pass, Isolation, Post Up, Fast Break, Alley Oop, Step Back, Fadeaway. A engine combina attrs + tendências (`combineScore` + `weightedSelect`) — sem rolagens simples.

```js
import { simulateGame, buildDefaultMatchup } from './engine'

const matchup = buildDefaultMatchup('gsw', 'bos')
const result = simulateGame(matchup)
// result.playByPlay → lista completa de ações
// result.boxScore, placarFinal, mvp, styles…
```

Rota UI: `/match` (facade em `engine/match` só para lineups + compat).

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
