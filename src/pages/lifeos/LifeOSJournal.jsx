import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import LifeOSLayout from '@/components/lifeos/LifeOSLayout'
import { todayStr } from '@/lib/gamification'
import { Save, BookOpen } from 'lucide-react'

const GOLD = '#F4C430'
const MOODS = ['😊', '😐', '😔', '😤', '🤩', '😴', '🧘']

export default function LifeOSJournal() {
  const { user } = useAuth()
  const [entries, setEntries] = useState([])
  const [today, setToday]     = useState(null)
  const [form, setForm]       = useState({ content: '', gratitude: '', mood: '😊' })
  const [saved, setSaved]     = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (user) load() }, [user])

  async function load() {
    const { data } = await supabase.from('lifeos_journal_entries').select('*')
      .eq('user_id', user.id).order('date', { ascending: false }).limit(10)
    const entries = data || []
    const t = entries.find(e => e.date === todayStr())
    setToday(t || null)
    if (t) setForm({ content: t.content || '', gratitude: t.gratitude || '', mood: t.mood || '😊' })
    setEntries(entries.filter(e => e.date !== todayStr()))
    setLoading(false)
  }

  async function save() {
    if (today) {
      await supabase.from('lifeos_journal_entries').update({ ...form }).eq('id', today.id)
    } else {
      const { data } = await supabase.from('lifeos_journal_entries')
        .insert({ user_id: user.id, ...form, date: todayStr() }).select().single()
      setToday(data)
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) return <LifeOSLayout><div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" /></div></LifeOSLayout>

  return (
    <LifeOSLayout>
      <div className="px-4 md:px-8 py-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-black mb-6">Journal</h1>

        {/* Today */}
        <div className="mb-6 p-5 rounded-2xl" style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold" style={{ color: GOLD }}>Hoje — {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
            <div className="flex gap-1">
              {MOODS.map(m => (
                <button key={m} onClick={() => setForm(p => ({ ...p, mood: m }))}
                  className="text-lg p-1 rounded-lg transition-all"
                  style={{ background: form.mood === m ? 'rgba(244,196,48,0.15)' : 'transparent' }}>
                  {m}
                </button>
              ))}
            </div>
          </div>
          <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
            placeholder="Como foi o seu dia? O que você conquistou? O que pode melhorar amanhã?"
            rows={5} className="w-full bg-transparent text-sm outline-none resize-none mb-3"
            style={{ color: '#ccc' }} />
          <input value={form.gratitude} onChange={e => setForm(p => ({ ...p, gratitude: e.target.value }))}
            placeholder="3 coisas pelas quais sou grato hoje..."
            className="w-full bg-transparent border-t pt-3 text-sm outline-none"
            style={{ borderColor: 'rgba(255,255,255,0.05)', color: '#888' }} />
          <button onClick={save}
            className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
            style={{ background: saved ? 'rgba(34,197,94,0.15)' : 'rgba(244,196,48,0.12)', color: saved ? '#22c55e' : GOLD, border: `1px solid ${saved ? 'rgba(34,197,94,0.25)' : 'rgba(244,196,48,0.25)'}` }}>
            <Save className="w-4 h-4" />{saved ? 'Salvo!' : 'Salvar'}
          </button>
        </div>

        {/* Past entries */}
        {entries.length > 0 && (
          <div>
            <h2 className="text-sm font-bold mb-3" style={{ color: '#555' }}>Entradas anteriores</h2>
            <div className="space-y-3">
              {entries.map(e => (
                <div key={e.id} className="p-4 rounded-2xl" style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{e.mood || '😊'}</span>
                    <span className="text-xs" style={{ color: '#555' }}>{new Date(e.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}</span>
                  </div>
                  {e.content && <p className="text-sm line-clamp-3" style={{ color: '#666' }}>{e.content}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {entries.length === 0 && !today && (
          <div className="text-center py-8" style={{ color: '#444' }}>
            <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Escreva sua primeira entrada acima.</p>
          </div>
        )}
      </div>
    </LifeOSLayout>
  )
}
