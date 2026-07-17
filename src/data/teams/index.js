export const TEAMS = [
  {
    id: 'gsw',
    name: 'Golden State Warriors',
    short: 'GSW',
    city: 'San Francisco',
    conference: 'West',
  },
  {
    id: 'bos',
    name: 'Boston Celtics',
    short: 'BOS',
    city: 'Boston',
    conference: 'East',
  },
  {
    id: 'lal',
    name: 'Los Angeles Lakers',
    short: 'LAL',
    city: 'Los Angeles',
    conference: 'West',
  },
  {
    id: 'mia',
    name: 'Miami Heat',
    short: 'MIA',
    city: 'Miami',
    conference: 'East',
  },
  {
    id: 'den',
    name: 'Denver Nuggets',
    short: 'DEN',
    city: 'Denver',
    conference: 'West',
  },
  {
    id: 'nyk',
    name: 'New York Knicks',
    short: 'NYK',
    city: 'New York',
    conference: 'East',
  },
]

export const DEFAULT_TEAM_ID = 'gsw'

export function getTeamById(teamId) {
  return TEAMS.find((t) => t.id === teamId) ?? TEAMS[0]
}
