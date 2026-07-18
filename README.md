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
 │    ├── relationships/
 │    ├── contracts/
 │    ├── chemistry/
 │    ├── injuries/
 │    ├── coaches/
 │    ├── scouting/
 │    ├── personality/
 │    ├── dna/
 │    ├── playbook/
 │    ├── defense/
 │    ├── fatigue/
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
 │    ├── relationships/
 │    ├── contracts/
 │    ├── chemistry/
 │    ├── injuries/
 │    ├── personality/
 │    ├── dna/
 │    ├── playbook/
 │    ├── defense/
 │    ├── fatigue/
 │    ├── teams/
 │    ├── events/
 │    ├── coaches/
 │    └── constants/
 ├── store/          # Zustand (estado da UI)
 ├── hooks/
 ├── services/       # Fachada Interface → Engine
 └── assets/
```

## Analytics Engine

`src/engine/analytics/` + `src/data/analytics/` — estatísticas avançadas.

Métricas (todas calculadas na Engine; a Interface só exibe):

- **PER** · **True Shooting %** · **Effective FG %**
- **Usage %** · **Assist %** · **Rebound %**
- **Offensive Rating** · **Defensive Rating** · **Net Rating**
- **Win Shares** · **Player Impact Estimate (PIE)**

Fonte: box score da Simulation Engine (FGM/FGA/3P/FT, ORB/DRB, TOV…). Totais de temporada e carreira em `state.analytics`.

```js
analyzeGameBox(boxScore, { possessionCount })
computeAdvancedStats(line, teamContext)
processWeeklyAnalytics({ analytics, weekResults, seasonNumber, seasonRolled })
getAnalyticsView(state)
```

Persistido no Save (**v12**). UI: `AnalyticsPanel`.

## Hall of Fame Engine

`src/engine/hallOfFame/` + `src/data/hallOfFame/` — votação automática na aposentadoria.

Pontuação (0–100) com pesos para: **Títulos · MVPs · All-Star · All-NBA · DPOY · Pontos · Assistências · Rebotes · Longevidade · Popularidade**.

Classificação:

| Score | Classe |
|------:|--------|
| ≥ 78 | Primeira votação |
| ≥ 55 | Hall da Fama |
| &lt; 55 | Não entrou |

Toda votação (incluindo “Não entrou”) é salva permanentemente em `leagueHistory.hofBallots`; induzidos também em `leagueHistory.hallOfFame`. Totais de carreira em `leagueHistory.careerTotals`.

```js
processHallOfFameBallots({ history, gm, retirements, evaluatedSeason })
evaluateRetiredPlayer({ retirement, history, gm })
accumulateCareerTotals(history, weekResults)
creditSeasonHonors(history, archive)
getHallOfFameView(state)
```

Integrado via `processWeeklyHistory` no roll de aposentadorias. Persistido no Save (**v11**). UI: `HallOfFamePanel`.

## Scouting Engine

`src/engine/scouting/` + `src/data/scouting/` — observação de talentos (Draft + Free Agency).

Cada prospect: **potencial oculto · personalidade · tendências · fraquezas · pontos fortes**.

Quanto maior o **investimento** em scouting, mais precisas as estimativas (overall, faixa de potencial, revelação de traços).

A **Franchise AI** consome relatórios em `selectProspectForTeam` (Draft) e `scoreFa` (Free Agency) — nunca decide só com valores true.

```js
processWeeklyScouting({ scouting, gm, week, phase })
buildScoutReport(player, teamId, investment)
getScoutedView(player, report)
getScoutingView(state)
```

Persistido em `gm.scouting` (Save **v10**). UI: `ScoutingPanel` (fog of war).

## Coach Engine

`src/engine/coaches/` + `src/data/coaches/` — técnicos com decisões automáticas por pesos.

Cada treinador possui: **sistema ofensivo · sistema defensivo · rotação · confiança em jovens · rigor · motivação · desenvolvimento**.

Influencia: minutos, jogadas, treinos, desenvolvimento e relação com atletas.

```js
processWeeklyCoaches({ coaches, gm, careerTeamId, weekResults, … })
decideCoachWeek(coach, context) // foco, minutos, estilo, relação
getCoachView(state)
```

Persistido em `gm.coaches` (Save **v9**). UI: `CoachPanel`.

## Injury Engine

`src/engine/injuries/` + `src/data/injuries/` — saúde e lesões do jogador (e da liga).

Cada jogador possui: **risco · histórico · condição física · minutos/jogo · fadiga**.

Tipos: **Leve · Moderada · Grave** — com tempo estimado, chance de recaída, redução temporária de atributos e tratamento.

Recuperação ponderada por: equipe médica, descanso, idade e condição física (sem coin-flip puro).

```js
processWeeklyInjuries({ injuryEngine, player, status, activity, … })
rollInjuryEvent({ profile, activity, … })
tickInjuryRecovery({ injuryEngine, rested, accelerated, age })
getInjuryView(state)
```

Persistido em `injuryEngine` (+ espelho `injury` para compat). Save **v8**. UI: `InjuryPanel`.

## Chemistry Engine

`src/engine/chemistry/` + `src/data/chemistry/` — química entre **todos** os jogadores.

Cada **dupla** tem um valor **−100 … +100**, afetado por:

- Tempo jogando juntos
- Personalidade (inicial determinístico, sem RNG)
- Vitórias / derrotas
- Discussões / eventos
- Treinos (bonding, train, media)

Na **Simulation Engine**, a cada posse a química entra como **peso** em:

- Passe · Movimentação · Defesa · Eficiência ofensiva · Decisões da IA

```js
processWeeklyChemistry({ chemistry, gm, weekResults, activityType, … })
buildLineupChemistryEffects(chemistryState, lineup, relationshipBonus)
getChemistryView(state)
```

Nunca usa aleatório puro para química — só pesos. Persistido em `gm.chemistry` (Save `v7`). UI: `ChemistryPanel`.

## Contract Engine

`src/engine/contracts/` + `src/data/contracts/` — contratos da carreira.

- Renovação · Extensões · Ofertas de franquias
- Player Option · Team Option
- RFA · UFA
- Trade Clause · Buyout
- Negociação (salário, duração, bônus, cláusulas)

Franquias geram propostas com overall, potencial, idade, popularidade, personalidade, objetivos e salary cap.

```js
processWeeklyContracts(state, { week, seasonRolled, phase })
resolveContractDecision(state, 'accept' | 'negotiate' | 'refuse', terms?)
getContractView(state)
```

UI: `ContractPanel` + `ContractOfferPanel`. Save `v6`.

## Relationship Engine

`src/engine/relationships/` + `src/data/relationships/` — todos os vínculos do jogador (0–100):

**Treinador · GM · Companheiros · Torcida · Imprensa · Patrocinadores · Agente**

```js
increaseRelationship(rels, 'coach', 3)
decreaseRelationship(rels, 'press', 2)
calculateRelationshipEffects(rels) // minutos, química, XP, contratos, patrocínios…
getRelationshipStatus(rels)        // tiers / média
processWeeklyRelationships({ relationships, activity, chemDelta, … })
```

Cada atividade/evento/notícia altera um ou mais relacionamentos. Os efeitos influenciam eventos, contratos, tempo de quadra, química, patrocínios e evolução. Persistido no Save (`SAVE_VERSION` 5). UI: `RelationshipPanel`.

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
- Hall da Fama + votações HOF (Hall of Fame Engine)
- Totais de carreira (pts/ast/reb + honras)
- Aposentadorias

No roll de temporada, a Season Engine anterior é arquivada **antes** do reset. O log semanal (`history`, cap 120) é separado de `leagueHistory` (ilimitado).

```js
processWeeklyHistory({ leagueHistory, previousSeason, seasonRolled, weekResults, gmDecisions })
// → { leagueHistory, summary, messages }

getHistoryView(leagueHistory)
getHallOfFameView(state)
```

Persistido no Save System (`SAVE_VERSION` 11). UI: `HistoryPanel` + `HallOfFamePanel`.

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

## Draft Night Engine

`src/engine/draftNight/` + `src/data/draftNight/` — tela exclusiva de **transmissão** do Draft (estilo ESPN).

Agrega Draft · Scouting · Franchise · News. Monta frames pick a pick; a Interface só avança o índice e atualiza o painel.

Mostra: relógio da escolha · Mock Draft · prospects disponíveis · necessidades da franquia · análise · comparação · reação da torcida · notícias em tempo real.

```js
getDraftNightStatus(state)
buildDraftNightLive(gm, seasonState)   // executa draft + frames; aplica GM na store
buildDraftNightReplay(gm)              // replay de lastDraft
getDraftNightFrame(broadcast, index)
// UI: /draft-night
```

## Free Agency Engine

`src/engine/freeAgency/` + `src/data/freeAgency/` — tela de **mercado de agentes livres**.

Agrega GM · Franchise AI · Scouting · News · History. **Toda negociação usa a Contract Engine** (`generateFranchiseOffer`, `negotiateOffer`, `contractFromOffer`).

Mostra: jogadores livres · interesse por franquia · salário pedido · popularidade · idade · potencial · comparação · histórico · rumores.

Filtros: posição · idade · overall · salário.

```js
getFreeAgencyView(state, filters)
createFaOffer(state, playerId)
negotiateFaOffer(state, terms)
acceptFaOffer(state)
// UI: /free-agency · Save v26 (gm.pendingFaOffer)
```

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

## Fatigue Engine

`src/engine/fatigue/` + `src/data/fatigue/` — fadiga avançada.

Controla: **partida · semana · temporada · minutos consecutivos · viagens · back-to-back · overload**.

Altera: velocidade, precisão, defesa, tomada de decisão, chance de lesão, recuperação e treinos.

Recuperação depende de **descanso × equipe médica × idade**.

```js
processWeeklyFatigue({ fatigue, player, activity, season, medicalStaff, … })
buildFatigueEffects(state)
applyFatigueToPlayer(player, effects)
resolveSideGameFatigue({ season, teamId, careerFatigue })
getFatigueView(state)
```

Persistido em `state.fatigue` (**Save v18**). UI: `FatiguePanel`.

## Momentum Engine

`src/engine/momentum/` + `src/data/momentum/` — momento psicológico da partida.

Fatores: **sequência de acertos · sequência de erros · torcida · clutch · rivalidade · timeout · enterradas · tocos · bolas de três consecutivas**.

Altera temporariamente (modificadores pequenos e progressivos, teto **±7%**): confiança, tomada de decisão, precisão e agressividade. Soft caps 18–82.

```js
createGameMomentum({ homeTeamId, awayTeamId, rivalry, isPlayoff })
updateMomentumFromPossession(state, result, ctx)
buildMomentumEffects(value)
withMomentumLineup(players, effects)
getMomentumView(state)
```

Snapshot em `match.momentum` / `state.lastMomentum` (**Save v19**). UI: `MomentumPanel`.

## Trade Engine

`src/engine/trade/` + `src/data/trade/` — todas as trocas da liga.

Valor de mercado automático por atleta: **overall · idade · potencial · contrato · personalidade · posição · necessidade do elenco · objetivo da franquia · salary cap**.

IA negocia pacotes entre franquias (1×1, 2×1, 1×2, jogador+pick). Suporta **múltiplos jogadores e escolhas de draft**. Regras anti-irreal: matching salarial (125%+$5M), ratio de valor ≤1.22, NTC, limites de elenco, surplus mínimo do parceiro.

```js
calcPlayerMarketValue(player, contract)
findBestNegotiatedTrade(gm, sit, seasonState)
executeTrade(gm, proposal)
validateTrade(gm, proposal, sitA, sitB)
getTradeView(state)
```

Picks em `gm.draftPicks` · histórico `gm.lastTrades` (**Save v20**). UI: `TradePanel`.

## Expansion Engine

`src/engine/expansion/` + `src/data/expansion/` — expansão automática da liga.

Após **3 temporadas** completas: novas franquias (SEA Cascade, ORL Pulse) com identidade visual, uniformes e arenas; **Expansion Draft** (times existentes protegem 4); novo calendário regenerado; integração com Season · GM · Draft · History · News · Save — **sem painel de UI**.

```js
applyLeagueExpansion({ gm, expansion, previousSeasonNumber, newSeasonNumber })
runExpansionDraft(gm, expansionTeamIds)
hydrateExpansionState(state)
syncLeagueTeams(activeTeamIds)
```

Estado em `state.expansion` · registry `TEAMS` (**Save v21**).

## Dynasty Engine

`src/engine/dynasty/` + `src/data/dynasty/` — identifica dinastias históricas automaticamente.

Critérios (janela de 8 temporadas): **títulos · finais consecutivas · vitórias · domínio (win%) · MVPs · proxy All-NBA** (MVP / Finals MVP / título+domínio).

Tiers: emergente · dinastia · super dinastia. Ao reconhecer:
- News (`dynasty_recognized` / `dynasty_upgrade`)
- Achievements (métricas `dynasty*`)
- Registro em `leagueHistory.dynasties`
- Reputação da franquia + bias de contratação na Franchise AI

```js
processWeeklyDynasty({ dynasty, leagueHistory, seasonRolled, seasonNumber, gm })
detectDynasties(leagueHistory)
applyDynastyToWeights(weights, dynastyState, teamId)
```

Estado em `state.dynasty` (**Save v22**). Sem painel de UI.

## Legacy Engine

`src/engine/legacy/` + `src/data/legacy/` — legado de carreira e **Legacy Score** automático.

Critérios: **títulos · MVP · Finals MVP · All-Star · All-NBA · defesa · recordes · longevidade · popularidade · personalidade · momentos históricos · rivalidades**.

O score influencia Hall da Fama (blend), popularidade, valor histórico, narrativas (Story) e ranking histórico interno (`state.legacy.ranking` / `leagueHistory.legacyRanking`).

```js
processWeeklyLegacy({ legacy, leagueHistory, gm, analytics, dynasty, player })
calculateLegacyScore(inputs)
gatherLegacyInputs({ playerId, history, gm, … })
getLegacyView(state)
```

Estado em `state.legacy` (**Save v23**). Sem painel obrigatório.

## Records Engine

`src/engine/records/` + `src/data/records/` — controla todos os recordes da liga.

Categorias: **pontos · rebotes · assistências · roubos · tocos · triple-doubles · vitórias · temporadas · sequências · recordes de franquia · recordes da NBA** (jogo / temporada / carreira).

Sempre que um recorde é quebrado:
1. Atualiza o History Engine (`leagueHistory.records`)
2. Gera notícia (`record_broken`)
3. Cria progresso de conquistas (`recordsBroken`, `leagueRecordsHeld`, …)
4. Atualiza o Legacy Engine (insumo `records`)

```js
processWeeklyRecords({ records, leagueHistory, weekResults, standings, analytics, … })
getRecordsView(state)
```

Estado em `state.records` (**Save v24**). Sem painel obrigatório.

## Presentation Engine

`src/engine/presentation/` + `src/data/presentation/` — experiência visual sobre a Simulation Engine.

**Sem lógica de jogo.** Nunca altera resultados da simulação — só interpreta os dados gerados.

Responsabilidades:
- Sequência dos eventos da partida
- Destaques
- Narração textual
- Comentários
- Estatísticas em tempo real (timeline a partir do PBP)
- Animações como *cues* para a Interface disparar
- Ordem de exibição dos acontecimentos

```js
presentMatch(simulateGame(...))
getPresentationStep(presentation, index)
getAnimationCueAt(presentation, index)
getPresentationView(state)
```

On-demand (sandbox `/match`); prefs em `state.presentation` (**Save v25**). UI: `MatchPanel` / `MatchResult`.

## Match Center Engine

`src/engine/matchCenter/` + `src/data/matchCenter/` — página exclusiva de **pré-jogo**.

Agrega (sem simular): logos/identidade · titulares · últimos resultados · recordes · destaque · rivalidades · probabilidade · objetivos · condição física · lesões · árbitros.

```js
getMatchCenterView(state)
// Interface: /match-center → botão "Jogar Partida" → Simulation Engine
```

UI: `MatchCenterPanel`. Nenhuma lógica na Interface.

## Live Match Engine

`src/engine/liveMatch/` + `src/data/liveMatch/` — tela de **partida ao vivo**.

Consome apenas o Play-by-Play da Simulation Engine (frames pré-montados). A Interface só avança o índice com animações — **nunca re-simula**.

Mostra: placar · relógio · quarto · sequência · marcador · assistências · faltas · timeouts · momentum · probabilidade · stats ao vivo.

```js
buildLiveMatchFeed(matchResult)
getLiveMatchFrame(feed, index)
// UI: /live-match ← Jogar Partida no Match Center
```

Ver também **Draft Night Engine** (`/draft-night`) para a transmissão do Draft.

## Defensive Engine

`src/engine/defense/` + `src/data/defense/` — defesa coletiva em toda posse.

Esquemas: **Individual · Zona · Switch · Help Defense · Double Team · Trap · Drop Coverage · Hedge · Ice · Full Court Press**.

- Cada técnico tem `defenseBias` (preferências por esquema).
- A defesa **reage dinamicamente** à ameaça ofensiva (transição, PnR, iso, post, shooters, placar, fadiga).
- A Simulation Engine usa a Engine em pressão on-ball, ajuda, roubo, turnover e contest.

```js
decideDefensiveScheme({ defensePlayers, ballHandler, ctx, coach, defenseBias, rng })
adaptDefenseToSet(plan, offensiveSet, ctx, rng)
resolveOnBallPressure({ …, defenseEffects })
resolveShot({ …, defenseEffects })
getDefenseView(state)
```

Preferências no coach (`defenseBias`) · Save **v18** · UI: `DefensePanel`.

## Playbook Engine

`src/engine/playbook/` + `src/data/playbook/` — jogadas por franquia.

Categorias: **Pick and Roll · Pick and Pop · Isolation · Motion · Triangle · Horns · Flex · Spain PnR · Five Out · Post Up · High Low · Fast Break · Off Ball Screen**.

Cada jogada define: **posicionamento · prioridade · leitura · 1ª / 2ª / 3ª opção**.

A **Decision Engine** escolhe automaticamente a melhor jogada em cada posse, ponderando:

Coach · Jogadores disponíveis · Fadiga · Matchup · Tempo restante · Placar · Importância da partida.

```js
generateTeamPlaybook(teamId, coach)
decidePlaybookPlay({ offensePlayers, ballHandler, ctx, playbook, rng })
processWeeklyPlaybooks({ playbooks, gm, seasonRolled })
getPlaybookView(state)
```

Persistido em `gm.playbooks` (**Save v18**). UI: `PlaybookPanel`.

## Player DNA Engine

`src/engine/dna/` + `src/data/dna/` — identidade única de cada jogador.

Traços: **Ritmo · Agressividade · Confiança · Clutch · Criatividade · Consistência · Tendência a erros · Assumir responsabilidade · Preferência infiltração / arremesso / passe / contra-ataque**.

- O DNA **nunca muda completamente** — só evolui lentamente (âncora ± drift).
- A **Decision Engine** usa o DNA em **todas** as decisões (`scoreCandidate` + bias de sets).
- Dois jogadores com atributos iguais jogam de maneira diferente.
- Lógica isolada da Interface.

```js
generatePlayerDna(player)
ensurePlayerDna(player)
evolvePlayerDna(player, context)
processWeeklyDna({ player, gm, currentTeamId, week })
dnaFactors(player, role)
dnaSetBias(handler, setId)
getDnaView(state)
```

Persistido no Save (**v18**, em `player.dna` / `player.dnaAnchor` + overrides do GM). UI: `DnaPanel`.

## Decision Engine

`src/engine/decision/` + `src/data/decision/` — **cérebro da simulação**.

Decide todas as ações de uma posse com **sistema de pesos** (nunca RNG puro), considerando simultaneamente:

Atributos · Tendências · Personalidade · DNA · Química · Coach · Fadiga · Momentum · Matchup · Placar · Tempo restante · Pressão · Importância da partida.

Decide: quem arma · corta · recebe · infiltra · pede screen · pick and roll · arremessa · isola · tenta roubo · contesta · pega rebote.

```js
buildPossessionDecisionContext({ … })
decideBallHandler(players, ctx, rng)
decideScreener / decideCutter / decideReceiver / decideShooter / …
decide(decisionId, options, ctx, rng)
decideDuel(decisionId, scoreA, scoreB, ctx, rng)
```

A **Simulation Engine** consome a Decision Engine em toda posse (`possession.js` + `actors.js` + `actions.js`).

## Achievement Engine

`src/engine/achievements/` + `src/data/achievements/` — **291 conquistas** com progresso.

Categorias: Carreira · Temporada · Partida · Financeiro · Relacionamentos · Títulos · Estatísticas · Colecionáveis.

Cada conquista: **ID · Nome · Descrição · Categoria · Recompensa · Status · Progresso**.

```js
processWeeklyAchievements({ achievements, state, effects })
evaluateAchievements(achievements, state)
getAchievementsView(state)
```

Persistido em `state.achievements` via Save Engine (**v18**). UI: `AchievementsPanel`.

## Story Engine

`src/engine/story/` + `src/data/story/` — narrativas procedurais em **cadeias** (substitui eventos fixos).

Histórias são geradas dinamicamente a partir de: relacionamentos, personalidade, popularidade, desempenho, time, cidade, patrocínios, treinador, companheiros e liga.

Cada história possui: **Título · Descrição · Contexto · Escolhas · Consequências · Continuação futura**.

Decisões gravam **flags** e avançam **cadeias abertas** — a próxima história pode ser continuação, não um evento isolado.

```js
triggerStory(state, { activityType }, { rng })
resolveStoryChoice(state, storyId, choiceId)
generateStory(state, context, rng)
getStoryView(state)
```

Persistido em `state.story` (Save **v13**). UI: `EventChoicePanel` (porta `pendingEvent`).  
`triggerEvent` / `resolveEventChoice` permanecem como aliases de compatibilidade.

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
