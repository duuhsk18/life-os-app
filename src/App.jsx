import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { CartProvider } from '@/contexts/CartContext'
import { ToastProvider } from '@/components/lifeos/Toast'
import MetaPixel from '@/components/MetaPixel'
import ProtectedRoute from '@/components/lifeos/ProtectedRoute'

import Home             from '@/pages/Home'
import Login            from '@/pages/Login'
import ProductPage      from '@/pages/ProductPage'
import SalesPage        from '@/pages/SalesPage'
import Catalogo         from '@/pages/Catalogo'
import OTOPage          from '@/pages/OTOPage'
import ThankYou         from '@/pages/ThankYou'
import MinhaConta       from '@/pages/MinhaConta'
import Assinatura       from '@/pages/Assinatura'
import LifeOSDashboard  from '@/pages/lifeos/LifeOSDashboard'
import LifeOSHabits     from '@/pages/lifeos/LifeOSHabits'
import LifeOSWorkouts   from '@/pages/lifeos/LifeOSWorkouts'
import LifeOSFocus      from '@/pages/lifeos/LifeOSFocus'
import LifeOSJournal    from '@/pages/lifeos/LifeOSJournal'
import LifeOSFinancas   from '@/pages/lifeos/LifeOSFinancas'
import LifeOSGoals      from '@/pages/lifeos/LifeOSGoals'
import LifeOSStats      from '@/pages/lifeos/LifeOSStats'
import LifeOSProfile    from '@/pages/lifeos/LifeOSProfile'
import LifeOSBiblioteca from '@/pages/lifeos/LifeOSBiblioteca'

function Protected({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
      <ToastProvider>
      <BrowserRouter>
        <MetaPixel />
        <Routes>
          <Route path="/"                     element={<Home />} />
          <Route path="/login"                element={<Login />} />
          <Route path="/produto/:slug"        element={<ProductPage />} />
          <Route path="/p/:slug"              element={<SalesPage />} />
          <Route path="/catalogo"             element={<Catalogo />} />
          <Route path="/oto/life-os"          element={<OTOPage />} />
          <Route path="/obrigado"             element={<ThankYou />} />
          <Route path="/minha-conta"          element={<Protected><MinhaConta /></Protected>} />
          <Route path="/conta/assinatura"     element={<Protected><Assinatura /></Protected>} />
          <Route path="/membros"              element={<Protected><LifeOSDashboard /></Protected>} />
          <Route path="/membros/habitos"      element={<Protected><LifeOSHabits /></Protected>} />
          <Route path="/membros/treinos"      element={<Protected><LifeOSWorkouts /></Protected>} />
          <Route path="/membros/focus"        element={<Protected><LifeOSFocus /></Protected>} />
          <Route path="/membros/journal"      element={<Protected><LifeOSJournal /></Protected>} />
          <Route path="/membros/financas"     element={<Protected><LifeOSFinancas /></Protected>} />
          <Route path="/membros/metas"        element={<Protected><LifeOSGoals /></Protected>} />
          <Route path="/membros/estatisticas" element={<Protected><LifeOSStats /></Protected>} />
          <Route path="/membros/perfil"       element={<Protected><LifeOSProfile /></Protected>} />
          <Route path="/membros/biblioteca"   element={<Protected><LifeOSBiblioteca /></Protected>} />
          <Route path="*" element={<div style={{ background: '#000', color: '#555', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>Página não encontrada.</div>} />
        </Routes>
      </BrowserRouter>
      </ToastProvider>
      </CartProvider>
    </AuthProvider>
  )
}
