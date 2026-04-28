import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { calculateLevel, xpToNextLevel } from '@/lib/gamification'
import {
  Home, Dumbbell, BarChart2, Target, User, LogOut, Menu, X,
  Zap, BookOpen, DollarSign, CheckSquare, Library
} from 'lucide-react'

const NAV = [
  { path: '/membros',            icon: Home,        label: 'Dashboard'   },
  { path: '/membros/habitos',    icon: CheckSquare, label: 'Hábitos'     },
  { path: '/membros/treinos',    icon: Dumbbell,    label: 'Treinos'     },
  { path: '/membros/focus',      icon: Zap,         label: 'Estado Flow' },
  { path: '/membros/journal',    icon: BookOpen,    label: 'Journal'     },
  { path: '/membros/financas',   icon: DollarSign,  label: 'Finanças'    },
  { path: '/membros/estatisticas', icon: BarChart2, label: 'Estatísticas'},
  { path: '/membros/metas',      icon: Target,      label: 'Metas'       },
  { path: '/membros/biblioteca', icon: Library,     label: 'Biblioteca'  },
  { path: '/membros/perfil',     icon: User,        label: 'Perfil'      },
]

const MOBILE_NAV = [
  { path: '/membros',            icon: Home,        label: 'Início'     },
  { path: '/membros/habitos',    icon: CheckSquare, label: 'Hábitos'    },
  { path: '/membros/focus',      icon: Zap,         label: 'Flow'       },
  { path: '/membros/biblioteca', icon: Library,     label: 'Biblioteca' },
  { path: '/membros/perfil',     icon: User,        label: 'Perfil'     },
]

const GOLD = '#F4C430'

export default function LifeOSLayout({ children }) {
  const { user, profile, signOut } = useAuth()
  const location = useLocation()
  const navigate  = useNavigate()
  const [open, setOpen] = useState(false)

  const levelInfo  = calculateLevel(profile?.total_xp || 0)
  const xpInfo     = xpToNextLevel(profile?.total_xp || 0)
  const firstName  = profile?.full_name?.split(' ')[0] || user?.user_metadata?.full_name?.split(' ')[0] || 'Membro'

  async function handleLogout() {
    await signOut()
    navigate('/')
  }

  function NavLink({ item }) {
    const active = location.pathname === item.path
    const Icon = item.icon
    return (
      <Link
        to={item.path}
        onClick={() => setOpen(false)}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
        style={{
          background: active ? 'rgba(244,196,48,0.1)' : 'transparent',
          color: active ? GOLD : '#555',
          border: active ? '1px solid rgba(244,196,48,0.2)' : '1px solid transparent',
        }}
      >
        <Icon className="w-4 h-4 flex-shrink-0" />
        {item.label}
      </Link>
    )
  }

  const Sidebar = ({ className = '' }) => (
    <div className={`flex flex-col h-full ${className}`} style={{ background: '#0a0a0a' }}>
      {/* Logo */}
      <div className="px-5 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <Link to="/membros" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black" style={{ background: GOLD, color: '#000' }}>L</div>
          <span className="font-black text-base tracking-tight">Life OS</span>
        </Link>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ background: 'rgba(244,196,48,0.15)', border: '1px solid rgba(244,196,48,0.3)', color: GOLD }}>
            {profile?.avatar_emoji || firstName[0] || '?'}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold truncate">{firstName}</div>
            <div className="text-xs" style={{ color: GOLD }}>Nível {levelInfo.level} · {levelInfo.title}</div>
          </div>
        </div>
        <div className="h-1 rounded-full overflow-hidden" style={{ background: '#1a1a1a' }}>
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${xpInfo.percent}%`, background: `linear-gradient(90deg, ${GOLD}, #FFD700)` }} />
        </div>
        <div className="flex justify-between text-xs mt-1" style={{ color: '#444' }}>
          <span>{(profile?.total_xp || 0).toLocaleString()} XP</span>
          {(profile?.current_streak || 0) > 0 && <span style={{ color: '#f59e0b' }}>🔥 {profile.current_streak}d</span>}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {NAV.map(item => <NavLink key={item.path} item={item} />)}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full transition-all hover:opacity-70"
          style={{ color: '#444' }}>
          <LogOut className="w-4 h-4" />Sair
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen" style={{ background: '#000', color: '#fff' }}>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-56 z-40"
        style={{ borderRight: '1px solid rgba(255,255,255,0.05)' }}>
        <Sidebar className="h-full" />
      </aside>

      {/* Mobile header */}
      <header className="md:hidden sticky top-0 z-50 flex items-center justify-between px-4 py-3"
        style={{ background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Link to="/membros" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black" style={{ background: GOLD, color: '#000' }}>L</div>
          <span className="font-black">Life OS</span>
        </Link>
        <div className="flex items-center gap-2">
          {(profile?.current_streak || 0) > 0 && (
            <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
              🔥 {profile.current_streak}
            </span>
          )}
          <button onClick={() => setOpen(!open)} className="p-2">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40" onClick={() => setOpen(false)}>
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.7)' }} />
          <div className="absolute left-0 top-0 bottom-0 w-64" onClick={e => e.stopPropagation()}>
            <Sidebar className="h-full" />
          </div>
        </div>
      )}

      {/* Main */}
      <main className="md:ml-56 min-h-screen pb-20 md:pb-8">{children}</main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex"
        style={{ background: 'rgba(10,10,10,0.97)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {MOBILE_NAV.map(item => {
          const active = location.pathname === item.path
          const Icon = item.icon
          return (
            <Link key={item.path} to={item.path}
              className="flex-1 flex flex-col items-center py-2.5 gap-0.5 text-[10px] font-medium"
              style={{ color: active ? GOLD : '#444' }}>
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
