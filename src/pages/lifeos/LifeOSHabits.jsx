import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import LifeOSLayout from '@/components/lifeos/LifeOSLayout'
import { useToast } from '@/components/lifeos/Toast'
import { todayStr, DEFAULT_HABITS } from '@/lib/gamification'
import { Plus, Trash2, Flame } from 'lucide-react'

const GOLD = '#F4C430'

export default function LifeOSHabits() {
  const { user, profile, refreshProfile } = useAuth()
  const toast = useToast()
  const [habits, setHabits]           = useState([])
  const [todayChecks, setTodayChecks] = useState([])
  const [showForm, setShowForm]       = useState(false)
  const [form, setForm]               = useState({ name: '', icon: '✅', xp_reward: 10 })
  const [loading, setLoading]         = useState(true)
  const today = todayStr()

  useEffect(() => { if (user) load() }, [user])

  async function load() {
    const [{ data: h }, { data: c }] = await Promise.all([
      supabase.from('lifeos_habits').select('*').eq('user_id', user.id).eq('active', true).order('created_at'),
      supabase.from('lifeos_habit_checks').select('*').eq('user_id', user.id).eq('date', today),
    ])
    setHabits(h || [])
    setTodayChecks(c || [])
    setLoading(false)
  }

  async function toggle(habit) {
    const existing = todayChecks.find(c => c.habit_id === habit.id)
    if (existing) {
      await supabase.from('lifeos_habit_checks').delete().eq('id', existing.id)
      setTodayChecks(p => p.filter(c => c.id !== existing.id))
      const newXp = Math.max(0, (profile?.total_xp || 0) - habit.xp_reward)
      await supabase.from('lifeos_profiles').update({ total_xp: newXp }).eq('id', user.id)
    } else {
      const { data } = await supabase.from('lifeos_habit_checks')
        .insert({ user_id: user.id, habit_id: habit.id, date: today, completed: true }).select().single()
      if (data) setTodayChecks(p => [...p, data])
      const newXp = (profile?.total_xp || 0) + habit.xp_reward
      await supabase.from('lifeos_profiles').update({ total_xp: newXp }).eq('id', user.id)
      toast.xp(habit.xp_reward, habit.name)
      // Vibração leve em mobile
      if (navigator.vibrate) navigator.vibrate(8)
    }
    refreshProfile()
  }

  async function addHabit() {
    if (!form.name.trim()) return
    const { data } = await supabase.from('lifeos_habits')
      .insert({ user_id: user.id, ...form, active: true }).select().single()
    if (data) setHabits(p => [...p, data])
    setForm({ name: '', icon: '✅', xp_reward: 10 })
    setShowForm(false)
  }

  async function addDefaults() {
    const rows = DEFAULT_HABITS.map(h => ({ ...h, user_id: user.id, active: true }))
    const { data } = await supabase.from('lifeos_habits').insert(rows).select()
    if (data) setHabits(p => [...p, ...data])
  }

  async function deleteHabit(id) {
    await supabase.from('lifeos_habits').update({ active: false }).eq('id', id)
    setHabits(p => p.filter(h => h.id !== id))
  }

  const done = todayChecks.filter(c => c.completed).length

  if (loading) return <LifeOSLayout><div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" /></div></LifeOSLayout>

  return (
    <LifeOSLayout>
      <div className="px-4 md:px-8 py-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black">Hábitos</h1>
            <p className="text-sm mt-1" style={{ color: '#555' }}>{done}/{habits.length} concluídos hoje</p>
          </div>
          <button onClick={() => setShowForm(s => !s)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
            style={{ background: 'rgba(244,196,48,0.12)', color: GOLD, border: '1px solid rgba(244,196,48,0.25)' }}>
            <Plus className="w-4 h-4" /> Novo
          </button>
        </div>

        {showForm && (
          <div className="mb-4 p-4 rounded-2xl space-y-3" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex gap-2">
              <input value={form.icon} onChange={e => setForm(p => ({ ...p, icon: e.target.value }))}
                className="w-12 bg-transparent text-center text-xl border rounded-xl px-2 py-2 outline-none"
                style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }} maxLength={2} />
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Nome do hábito" className="flex-1 bg-transparent border rounded-xl px-3 py-2 text-sm outline-none"
                style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }} />
              <select value={form.xp_reward} onChange={e => setForm(p => ({ ...p, xp_reward: Number(e.target.value) }))}
                className="bg-transparent border rounded-xl px-2 py-2 text-sm outline-none"
                style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#555' }}>
                {[5,10,15,20,25,50].map(v => <option key={v} value={v} style={{ background: '#111' }}>{v} XP</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={addHabit} className="flex-1 py-2 rounded-xl text-sm font-bold"
                style={{ background: GOLD, color: '#000' }}>Salvar</button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-sm"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#555' }}>Cancelar</button>
            </div>
          </div>
        )}

        {habits.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm mb-4" style={{ color: '#444' }}>Nenhum hábito ainda. Comece pelos padrões!</p>
            <button onClick={addDefaults} className="px-5 py-2.5 rounded-xl text-sm font-bold"
              style={{ background: GOLD, color: '#000' }}>+ Adicionar hábitos padrão</button>
          </div>
        ) : (
          <div className="space-y-2">
            {habits.map(habit => {
              const checked = todayChecks.some(c => c.habit_id === habit.id && c.completed)
              return (
                <div key={habit.id} className="flex items-center gap-3 px-4 py-3 rounded-2xl group"
                  style={{ background: checked ? 'rgba(244,196,48,0.07)' : '#0f0f0f', border: `1px solid ${checked ? 'rgba(244,196,48,0.2)' : 'rgba(255,255,255,0.05)'}` }}>
                  <button onClick={() => toggle(habit)}
                    className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                    style={{ borderColor: checked ? GOLD : '#333', background: checked ? GOLD : 'transparent' }}>
                    {checked && <span className="text-black text-xs font-black">✓</span>}
                  </button>
                  <span className="text-lg">{habit.icon}</span>
                  <span className="flex-1 text-sm font-medium" style={{ color: checked ? '#666' : '#ddd', textDecoration: checked ? 'line-through' : 'none' }}>
                    {habit.name}
                  </span>
                  <span className="text-xs font-bold mr-2" style={{ color: checked ? GOLD : '#333' }}>+{habit.xp_reward} XP</span>
                  <button onClick={() => deleteHabit(habit.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-lg transition-all"
                    style={{ color: '#444' }}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {(profile?.current_streak || 0) > 0 && (
          <div className="mt-6 flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <Flame className="w-5 h-5" style={{ color: '#f59e0b' }} />
            <span className="text-sm font-semibold" style={{ color: '#f59e0b' }}>
              🔥 Streak atual: {profile.current_streak} dia{profile.current_streak !== 1 ? 's' : ''} consecutivo{profile.current_streak !== 1 ? 's' : ''}!
            </span>
          </div>
        )}
      </div>
    </LifeOSLayout>
  )
}
