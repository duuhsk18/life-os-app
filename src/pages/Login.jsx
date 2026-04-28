import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

const GOLD = '#F4C430'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode]       = useState('login')
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [name, setName]       = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  async function handle(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    if (mode === 'login') {
      const { error } = await signIn(email, password)
      if (error) setError(error.message)
      else navigate('/membros')
    } else {
      const { error } = await signUp(email, password, name)
      if (error) setError(error.message)
      else navigate('/membros')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#000' }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg" style={{ background: GOLD, color: '#000' }}>L</div>
          <span className="font-black text-xl">Life OS</span>
        </div>

        <div className="p-6 rounded-2xl" style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.08)' }}>
          {/* Toggle */}
          <div className="flex rounded-xl overflow-hidden border mb-6" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            {['login', 'signup'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError('') }}
                className="flex-1 py-2.5 text-sm font-bold transition-all"
                style={{ background: mode === m ? 'rgba(244,196,48,0.1)' : 'transparent', color: mode === m ? GOLD : '#555' }}>
                {m === 'login' ? 'Entrar' : 'Criar conta'}
              </button>
            ))}
          </div>

          <form onSubmit={handle} className="space-y-3">
            {mode === 'signup' && (
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome"
                className="w-full bg-transparent border rounded-xl px-4 py-3 text-sm outline-none"
                style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }} required />
            )}
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="E-mail"
              className="w-full bg-transparent border rounded-xl px-4 py-3 text-sm outline-none"
              style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }} required />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Senha"
              className="w-full bg-transparent border rounded-xl px-4 py-3 text-sm outline-none"
              style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }} required minLength={6} />

            {error && <p className="text-xs text-center" style={{ color: '#ef4444' }}>{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-60"
              style={{ background: GOLD, color: '#000' }}>
              {loading ? '...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          </form>
        </div>

        <p className="text-center mt-4 text-xs" style={{ color: '#444' }}>
          <Link to="/" style={{ color: '#666' }}>← Voltar ao início</Link>
        </p>
      </div>
    </div>
  )
}
