import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Nav     from './components/Nav'
import Hero    from './components/Hero'
import About   from './components/About'
import Gallery from './components/Gallery'
import Events  from './components/Events'
import Cta     from './components/Cta'

import AdminLogin    from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import RequireAuth   from './pages/admin/RequireAuth'
import SuccessPage   from './pages/SuccessPage'

function PublicSite() {
  return (
    <div className="bg-offblack text-white overflow-x-hidden">
      <Nav />
      <Hero />
      <About />
      <Gallery />
      <Events />
      <Cta />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicSite />} />
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
