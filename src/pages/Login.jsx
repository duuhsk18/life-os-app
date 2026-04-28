import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

const GOLD = '#F4C430'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handle(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn(email, password)
    if (error) setError('E-mail ou senha incorretos. Verifique seu e-mail de acesso.')
    else navigate('/minha-conta')
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#000' }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg" style={{ background: GOLD, color: '#000' }}>L</div>
          <span className="font-black text-xl text-white">Life OS</span>
        </div>

        <div className="p-6 rounded-2xl" style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h1 className="text-white font-black text-lg text-center mb-1">Acessar minha conta</h1>
          <p className="text-gray-500 text-xs text-center mb-6">
            Use as credenciais enviadas por e-mail após sua compra
          </p>

          <form onSubmit={handle} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Seu e-mail"
              className="w-full bg-transparent border rounded-xl px-4 py-3 text-sm outline-none text-white"
              style={{ borderColor: 'rgba(255,255,255,0.1)' }}
              required
            />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Sua senha"
              className="w-full bg-transparent border rounded-xl px-4 py-3 text-sm outline-none text-white"
              style={{ borderColor: 'rgba(255,255,255,0.1)' }}
              required
              minLength={6}
            />

            {error && (
              <p className="text-xs text-center text-red-400 bg-red-900/20 rounded-lg py-2 px-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-60"
              style={{ background: GOLD, color: '#000' }}
            >
              {loading ? 'Entrando...' : 'Entrar →'}
            </button>
          </form>

          <p className="text-center mt-4 text-xs text-gray-600">
            Não recebeu seu acesso?{' '}
            <a href="mailto:suporte@lifeos.com.br" style={{ color: GOLD }}>
              Fale com o suporte
            </a>
          </p>
        </div>

        <p className="text-center mt-4 text-xs">
          <Link to="/catalogo" style={{ color: '#666' }}>← Ver nossos produtos</Link>
        </p>
      </div>
    </div>
  )
}
