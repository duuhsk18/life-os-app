import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import LifeOSLayout from '@/components/lifeos/LifeOSLayout'
import { todayStr } from '@/lib/gamification'
import { Plus, TrendingUp, TrendingDown, Trash2 } from 'lucide-react'

const GOLD = '#F4C430'
const CATS_EXPENSE = ['Alimentação', 'Moradia', 'Transporte', 'Saúde', 'Lazer', 'Educação', 'Roupas', 'Outros']
const CATS_INCOME  = ['Salário', 'Freelance', 'Investimentos', 'Venda', 'Outros']

export default function LifeOSFinancas() {
  const { user } = useAuth()
  const [records, setRecords] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ type: 'expense', description: '', amount: '', category: 'Outros', date: todayStr() })
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (user) load() }, [user])

  async function load() {
    const { data } = await supabase.from('lifeos_finance_records').select('*')
      .eq('user_id', user.id).order('date', { ascending: false })
    setRecords(data || [])
    setLoading(false)
  }

  async function save() {
    if (!form.amount || !form.description.trim()) return
    const { data } = await supabase.from('lifeos_finance_records')
      .insert({ user_id: user.id, ...form, amount: parseFloat(form.amount) }).select().single()
    if (data) setRecords(p => [data, ...p])
    setForm({ type: 'expense', description: '', amount: '', category: 'Outros', date: todayStr() })
    setShowForm(false)
  }

  async function remove(id) {
    await supabase.from('lifeos_finance_records').delete().eq('id', id)
    setRecords(p => p.filter(r => r.id !== id))
  }

  const totalIncome  = records.filter(r => r.type === 'income').reduce((s, r) => s + Number(r.amount), 0)
  const totalExpense = records.filter(r => r.type === 'expense').reduce((s, r) => s + Number(r.amount), 0)
  const balance      = totalIncome - totalExpense

  const fmt = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  if (loading) return <LifeOSLayout><div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" /></div></LifeOSLayout>

  return (
    <LifeOSLayout>
      <div className="px-4 md:px-8 py-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black">Finanças</h1>
          <button onClick={() => setShowForm(s => !s)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
            style={{ background: 'rgba(244,196,48,0.12)', color: GOLD, border: '1px solid rgba(244,196,48,0.25)' }}>
            <Plus className="w-4 h-4" /> Adicionar
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Receitas', value: totalIncome,  color: '#22c55e', Icon: TrendingUp },
            { label: 'Despesas', value: totalExpense, color: '#ef4444', Icon: TrendingDown },
            { label: 'Saldo',    value: balance,      color: balance >= 0 ? GOLD : '#ef4444', Icon: balance >= 0 ? TrendingUp : TrendingDown },
          ].map(s => (
            <div key={s.label} className="p-4 rounded-2xl text-center" style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.05)' }}>
              <s.Icon className="w-4 h-4 mx-auto mb-1" style={{ color: s.color }} />
              <div className="text-sm font-black" style={{ color: s.color }}>{fmt(s.value)}</div>
              <div className="text-xs mt-0.5" style={{ color: '#444' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {showForm && (
          <div className="mb-4 p-4 rounded-2xl space-y-3" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
              {['expense', 'income'].map(t => (
                <button key={t} onClick={() => setForm(p => ({ ...p, type: t, category: t === 'expense' ? 'Outros' : 'Salário' }))}
                  className="flex-1 py-2 text-sm font-bold transition-all"
                  style={{ background: form.type === t ? (t === 'expense' ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)') : 'transparent', color: form.type === t ? (t === 'expense' ? '#ef4444' : '#22c55e') : '#555' }}>
                  {t === 'expense' ? 'Despesa' : 'Receita'}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Descrição" className="flex-1 bg-transparent border rounded-xl px-3 py-2 text-sm outline-none"
                style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }} />
              <input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                placeholder="R$" className="w-28 bg-transparent border rounded-xl px-3 py-2 text-sm outline-none"
                style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }} />
            </div>
            <div className="flex gap-2">
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                className="flex-1 bg-transparent border rounded-xl px-3 py-2 text-sm outline-none"
                style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#ccc', background: '#111' }}>
                {(form.type === 'expense' ? CATS_EXPENSE : CATS_INCOME).map(c => <option key={c} style={{ background: '#111' }}>{c}</option>)}
              </select>
              <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                className="bg-transparent border rounded-xl px-3 py-2 text-sm outline-none"
                style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#ccc' }} />
            </div>
            <div className="flex gap-2">
              <button onClick={save} className="flex-1 py-2 rounded-xl text-sm font-bold" style={{ background: GOLD, color: '#000' }}>Salvar</button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-sm" style={{ background: 'rgba(255,255,255,0.05)', color: '#555' }}>Cancelar</button>
            </div>
          </div>
        )}

        {records.length === 0 ? (
          <div className="text-center py-12 text-sm" style={{ color: '#444' }}>Nenhum lançamento ainda.</div>
        ) : (
          <div className="space-y-2">
            {records.map(r => (
              <div key={r.id} className="flex items-center gap-3 px-4 py-3 rounded-2xl group"
                style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: r.type === 'income' ? '#22c55e' : '#ef4444' }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{r.description}</div>
                  <div className="text-xs" style={{ color: '#555' }}>{r.category} · {r.date}</div>
                </div>
                <span className="font-bold text-sm" style={{ color: r.type === 'income' ? '#22c55e' : '#ef4444' }}>
                  {r.type === 'income' ? '+' : '-'}{fmt(Number(r.amount))}
                </span>
                <button onClick={() => remove(r.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded-lg transition-all" style={{ color: '#444' }}>
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
