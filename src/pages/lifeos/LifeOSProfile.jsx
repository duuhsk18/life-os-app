import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import LifeOSLayout from '@/components/lifeos/LifeOSLayout'
import { calculateLevel, xpToNextLevel, LEVELS } from '@/lib/gamification'
import { Save, User } from 'lucide-react'

const GOLD = '#F4C430'
const AVATARS = ['😊','😎','🧠','💪','🔥','⚡','🎯','🦁','🐉','🚀','👑','🌟']

export default function LifeOSProfile() {
  const { user, profile, refreshProfile } = useAuth()
  const [name, setName]     = useState(profile?.full_name || user?.user_metadata?.full_name || '')
  const [emoji, setEmoji]   = useState(profile?.avatar_emoji || '😊')
  const [saved, setSaved]   = useState(false)

  async function save() {
    await supabase.from('lifeos_profiles').upsert({ id: user.id, full_name: name, avatar_emoji: emoji, email: user.email }, { onConflict: 'id' })
    await refreshProfile()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const levelInfo = calculateLevel(profile?.total_xp || 0)
  const xpInfo    = xpToNextLevel(profile?.total_xp || 0)

  return (
    <LifeOSLayout>
      <div className="px-4 md:px-8 py-6 max-w-xl mx-auto">
        <h1 className="text-2xl font-black mb-6">Perfil</h1>

        {/* Level card */}
        <div className="p-5 rounded-2xl mb-6" style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
              style={{ background: 'rgba(244,196,48,0.1)', border: '2px solid rgba(244,196,48,0.3)' }}>
              {emoji}
            </div>
            <div>
              <div className="font-black text-lg">{name || 'Membro'}</div>
              <div className="text-sm" style={{ color: GOLD }}>Nível {levelInfo.level} — {levelInfo.title}</div>
              <div className="text-xs mt-0.5" style={{ color: '#555' }}>{profile?.total_xp || 0} XP total</div>
            </div>
          </div>
          <div className="h-2 rounded-full overflow-hidden mb-1" style={{ background: '#1a1a1a' }}>
            <div className="h-full rounded-full" style={{ width: `${xpInfo.percent}%`, background: `linear-gradient(90deg, ${GOLD}, #FFD700)` }} />
          </div>
          <p className="text-xs" style={{ color: '#444' }}>
            {xpInfo.isMaxLevel ? '🏆 Nível máximo alcançado!' : `${xpInfo.xpNeeded} XP para o nível ${levelInfo.level + 1}`}
          </p>
        </div>

        {/* Edit */}
        <div className="p-5 rounded-2xl mb-4 space-y-4" style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <label className="text-xs font-semibold mb-2 block" style={{ color: '#555' }}>Nome</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-transparent border rounded-xl px-4 py-3 text-sm outline-none"
              style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }} />
          </div>
          <div>
            <label className="text-xs font-semibold mb-2 block" style={{ color: '#555' }}>Avatar</label>
            <div className="flex flex-wrap gap-2">
              {AVATARS.map(a => (
                <button key={a} onClick={() => setEmoji(a)}
                  className="w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all"
                  style={{ background: emoji === a ? 'rgba(244,196,48,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${emoji === a ? 'rgba(244,196,48,0.3)' : 'transparent'}` }}>
                  {a}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: '#555' }}>E-mail</label>
            <p className="text-sm" style={{ color: '#444' }}>{user?.email}</p>
          </div>
          <button onClick={save}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{ background: saved ? 'rgba(34,197,94,0.15)' : GOLD, color: saved ? '#22c55e' : '#000', border: saved ? '1px solid rgba(34,197,94,0.3)' : 'none' }}>
            <Save className="w-4 h-4" />{saved ? 'Salvo!' : 'Salvar alterações'}
          </button>
        </div>

        {/* Level map */}
        <div className="p-5 rounded-2xl" style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 className="text-sm font-bold mb-3" style={{ color: GOLD }}>Mapa de níveis</h2>
          <div className="space-y-2">
            {LEVELS.map(l => {
              const reached = (profile?.total_xp || 0) >= l.xp
              const current = levelInfo.level === l.level
              return (
                <div key={l.level} className="flex items-center gap-3 px-3 py-2 rounded-xl"
                  style={{ background: current ? 'rgba(244,196,48,0.08)' : 'transparent', border: current ? '1px solid rgba(244,196,48,0.15)' : '1px solid transparent' }}>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                    style={{ background: reached ? GOLD : '#1a1a1a', color: reached ? '#000' : '#333' }}>
                    {l.level}
                  </div>
                  <span className="text-sm flex-1" style={{ color: reached ? '#ccc' : '#333' }}>{l.title}</span>
                  <span className="text-xs" style={{ color: '#444' }}>{l.xp.toLocaleString()} XP</span>
                  {current && <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(244,196,48,0.15)', color: GOLD }}>atual</span>}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </LifeOSLayout>
  )
}
