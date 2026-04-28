import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import LifeOSLayout from '@/components/lifeos/LifeOSLayout'
import { todayStr } from '@/lib/gamification'
import { Plus, Dumbbell, Clock, Trash2 } from 'lucide-react'

const GOLD = '#F4C430'
const TYPES = ['Academia', 'Casa', 'Corrida', 'Ciclismo', 'Natação', 'Funcional', 'HIIT', 'Yoga', 'Outro']

export default function LifeOSWorkouts() {
  const { user, profile, refreshProfile } = useAuth()
  const [workouts, setWorkouts] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState({ name: '', type: 'Academia', duration_minutes: 60, notes: '' })
  const [loading, setLoading]   = useState(true)

  useEffect(() => { if (user) load() }, [user])

  async function load() {
    const { data } = await supabase.from('lifeos_workouts').select('*')
      .eq('user_id', user.id).order('created_at', { ascending: false })
    setWorkouts(data || [])
    setLoading(false)
  }

  async function save() {
    if (!form.name.trim()) return
    const { data } = await supabase.from('lifeos_workouts')
      .insert({ user_id: user.id, ...form, date: todayStr() }).select().single()
    if (data) {
      setWorkouts(p => [data, ...p])
      const newXp = (profile?.total_xp || 0) + 50
      await supabase.from('lifeos_profiles').update({ total_xp: newXp }).eq('id', user.id)
      refreshProfile()
    }
    setForm({ name: '', type: 'Academia', duration_minutes: 60, notes: '' })
    setShowForm(false)
  }

  async function remove(id) {
    await supabase.from('lifeos_workouts').delete().eq('id', id)
    setWorkouts(p => p.filter(w => w.id !== id))
  }

  if (loading) return <LifeOSLayout><div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" /></div></LifeOSLayout>

  return (
    <LifeOSLayout>
      <div className="px-4 md:px-8 py-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black">Treinos</h1>
            <p className="text-sm mt-1" style={{ color: '#555' }}>{workouts.length} sessões registradas</p>
          </div>
          <button onClick={() => setShowForm(s => !s)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
            style={{ background: 'rgba(244,196,48,0.12)', color: GOLD, border: '1px solid rgba(244,196,48,0.25)' }}>
            <Plus className="w-4 h-4" /> Registrar
          </button>
        </div>

        {showForm && (
          <div className="mb-4 p-4 rounded-2xl space-y-3" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Nome do treino" className="w-full bg-transparent border rounded-xl px-3 py-2 text-sm outline-none"
              style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }} />
            <div className="flex gap-2">
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                className="flex-1 bg-transparent border rounded-xl px-3 py-2 text-sm outline-none"
                style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#ccc', background: '#111' }}>
                {TYPES.map(t => <option key={t} value={t} style={{ background: '#111' }}>{t}</option>)}
              </select>
              <input type="number" value={form.duration_minutes} onChange={e => setForm(p => ({ ...p, duration_minutes: Number(e.target.value) }))}
                className="w-24 bg-transparent border rounded-xl px-3 py-2 text-sm outline-none text-center"
                style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#ccc' }} placeholder="min" />
            </div>
            <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              placeholder="Notas (opcional)" rows={2}
              className="w-full bg-transparent border rounded-xl px-3 py-2 text-sm outline-none resize-none"
              style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#ccc' }} />
            <div className="flex gap-2">
              <button onClick={save} className="flex-1 py-2 rounded-xl text-sm font-bold" style={{ background: GOLD, color: '#000' }}>
                Salvar +50 XP
              </button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-sm"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#555' }}>Cancelar</button>
            </div>
          </div>
        )}

        {workouts.length === 0 ? (
          <div className="text-center py-12" style={{ color: '#444' }}>
            <Dumbbell className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhum treino registrado ainda.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {workouts.map(w => (
              <div key={w.id} className="flex items-start gap-3 px-4 py-3 rounded-2xl group"
                style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(59,130,246,0.15)' }}>
                  <Dumbbell className="w-4 h-4" style={{ color: '#3b82f6' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{w.name}</div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>{w.type}</span>
                    <span className="text-xs flex items-center gap-1" style={{ color: '#555' }}>
                      <Clock className="w-3 h-3" />{w.duration_minutes}min
                    </span>
                    <span className="text-xs" style={{ color: '#333' }}>{w.date}</span>
                  </div>
                  {w.notes && <p className="text-xs mt-1" style={{ color: '#555' }}>{w.notes}</p>}
                </div>
                <button onClick={() => remove(w.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded-lg transition-all" style={{ color: '#444' }}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </LifeOSLayout>
  )
}
