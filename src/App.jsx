import { BrowserRouter, Route, Routes } from 'react-router-dom'

import AdminLogin    from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import RequireAuth   from './pages/admin/RequireAuth'
import PublicLayout from './layouts/PublicLayout'
import AtoladoPage from './pages/AtoladoPage'
import EventsPage from './pages/EventsPage'
import HomePage from './pages/HomePage'
import SuccessPage   from './pages/SuccessPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/eventos" element={<EventsPage />} />
          <Route path="/atolado-do-mes" element={<AtoladoPage />} />
        </Route>
        <Route path="/inscricao/sucesso" element={<SuccessPage />} />
        <Route path="/inscricao/erro" element={<SuccessPage />} />
        <Route path="/inscricao/pendente" element={<SuccessPage />} />
        <Route path="/offroad-admin" element={<AdminLogin />} />
        <Route path="/offroad-admin/dashboard" element={
          <RequireAuth><AdminDashboard /></RequireAuth>
        } />
      </Routes>
    </BrowserRouter>
  )
}
