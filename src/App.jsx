import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './layouts'
import {
  CareerPage,
  DraftNightPage,
  FranchisePage,
  FreeAgencyPage,
  LiveMatchPage,
  MatchCenterPage,
  MatchPage,
  NbaTvPage,
  PlayerProfilePage,
} from './pages'

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<CareerPage />} />
          <Route path="/match-center" element={<MatchCenterPage />} />
          <Route path="/live-match" element={<LiveMatchPage />} />
          <Route path="/draft-night" element={<DraftNightPage />} />
          <Route path="/free-agency" element={<FreeAgencyPage />} />
          <Route path="/nba-tv" element={<NbaTvPage />} />
          <Route path="/franchise" element={<FranchisePage />} />
          <Route path="/player-profile" element={<PlayerProfilePage />} />
          <Route path="/match" element={<MatchPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  )
}
