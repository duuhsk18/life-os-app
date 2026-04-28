import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import LifeOSLayout from '@/components/lifeos/LifeOSLayout'
import { Plus, Target, CheckCircle, Trash2 } from 'lucide-react'

const GOLD = '#F4C430'

export default function LifeOSGoals() {
  const { user } = useAuth()
  const [goals, setGoals]   = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]     = useState({ title: '', description: '', deadline: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (user) load() }, [user])

  async function load() {
    const { data } = await supabase.from('lifeos_goals').select('*')
      .eq('user_id', user.id).order('created_at', { ascending: false })
    setGoals(data || [])
    setLoading(false)
  }

  async function save() {
    if (!form.title.trim()) return
    const { data } = await supabase.from('lifeos_goals')
      .insert({ user_id: user.id, ...form, status: 'active', progress: 0 }).select().single()
    if (data) setGoals(p => [data, ...p])
    setForm({ title: '', description: '', deadline: '' })
    setShowForm(false)
  }

  async function updateProgress(id, progress) {
    await supabase.from('lifeos_goals').update({ progress }).eq('id', id)
    setGoals(p => p.map(g => g.id === id ? { ...g, progress } : g))
  }

  async function complete(id) {
    await supabase.from('lifeos_goals').update({ status: 'completed', progress: 100 }).eq('id', id)
    setGoals(p => p.map(g => g.id === id ? { ...g, status: 'completed', progress: 100 } : g))
  }

  async function remove(id) {
    await supabase.from('lifeos_goals').delete().eq('id', id)
    setGoals(p => p.filter(g => g.id !== id))
  }

  const active    = goals.filter(g => g.status === 'active')
  const completed = goals.filter(g => g.status === 'completed')

  if (loading) return <LifeOSLayout><div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" /></div></LifeOSLayout>

  return (
    <LifeOSLayout>
      <div className="px-4 md:px-8 py-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black">Metas</h1>
            <p className="text-sm mt-1" style={{ color: '#555' }}>{active.length} ativas · {completed.length} concluídas</p>
          </div>
          <button onClick={() => setShowForm(s => !s)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
            style={{ background: 'rgba(244,196,48,0.12)', color: GOLD, border: '1px solid rgba(244,196,48,0.25)' }}>
            <Plus className="w-4 h-4" /> Nova meta
          </button>
        </div>

        {showForm && (
          <div className="mb-4 p-4 rounded-2xl space-y-3" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="Qual é a sua meta?" className="w-full bg-transparent border rounded-xl px-3 py-2 text-sm outline-none"
              style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }} />
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Descrição (opcional)" rows={2}
              className="w-full bg-transparent border rounded-xl px-3 py-2 text-sm outline-none resize-none"
              style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#ccc' }} />
            <div className="flex gap-2">
              <input type="date" value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))}
                className="flex-1 bg-transparent border rounded-xl px-3 py-2 text-sm outline-none"
                style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#ccc' }} />
              <button onClick={save} className="px-6 py-2 rounded-xl text-sm font-bold" style={{ background: GOLD, color: '#000' }}>Criar</button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-sm" style={{ background: 'rgba(255,255,255,0.05)', color: '#555' }}>✕</button>
            </div>
          </div>
        )}

        {active.length === 0 && completed.length === 0 ? (
          <div className="text-center py-12" style={{ color: '#444' }}>
            <Target className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Defina sua primeira meta!</p>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              {active.map(goal => (
                <div key={goal.id} className="p-4 rounded-2xl group" style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-2 h-2 mt-1.5 rounded-full flex-shrink-0" style={{ background: GOLD }} />
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{goal.title}</div>
                      {goal.description && <p className="text-xs mt-0.5" style={{ color: '#555' }}>{goal.description}</p>}
                      {goal.deadline && <p className="text-xs mt-0.5" style={{ color: '#444' }}>Prazo: {new Date(goal.deadline + 'T12:00:00').toLocaleDateString('pt-BR')}</p>}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => complete(goal.id)} className="p-1 rounded-lg" style={{ color: '#22c55e' }}><CheckCircle className="w-4 h-4" /></button>
                      <button onClick={() => remove(goal.id)} className="p-1 rounded-lg" style={{ color: '#444' }}><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#1a1a1a' }}>
                      <div className="h-full rounded-full" style={{ width: `${goal.progress || 0}%`, background: GOLD }} />
                    </div>
                    <span className="text-xs font-bold" style={{ color: GOLD }}>{goal.progress || 0}%</span>
                    <input type="range" min={0} max={100} value={goal.progress || 0}
                      onChange={e => updateProgress(goal.id, Number(e.target.value))}
                      className="w-20 accent-yellow-400" />
                  </div>
                </div>
              ))}
            </div>

            {completed.length > 0 && (
              <div>
                <h2 className="text-xs font-bold mb-3 uppercase tracking-widest" style={{ color: '#333' }}>Concluídas</h2>
                <div className="space-y-2">
                  {completed.map(goal => (
                    <div key={goal.id} className="flex items-center gap-3 px-4 py-3 rounded-xl group"
                      style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.03)' }}>
                      <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#22c55e' }} />
                      <span className="flex-1 text-sm line-through" style={{ color: '#444' }}>{goal.title}</span>
                      <button onClick={() => remove(goal.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded-lg" style={{ color: '#333' }}><Trash2 className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </LifeOSLayout>
  )
}
