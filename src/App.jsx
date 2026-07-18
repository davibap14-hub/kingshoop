import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './layouts'
import {
  CareerPage,
  DraftNightPage,
  FreeAgencyPage,
  LiveMatchPage,
  MatchCenterPage,
  MatchPage,
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
          <Route path="/match" element={<MatchPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  )
}
