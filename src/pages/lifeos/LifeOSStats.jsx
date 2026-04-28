import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import LifeOSLayout from '@/components/lifeos/LifeOSLayout'
import { calculateLevel } from '@/lib/gamification'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from 'recharts'

const GOLD = '#F4C430'
const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export default function LifeOSStats() {
  const { user, profile } = useAuth()
  const [habits, setHabits]   = useState([])
  const [checks, setChecks]   = useState([])
  const [workouts, setWorkouts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (user) load() }, [user])

  async function load() {
    const since = new Date(); since.setDate(since.getDate() - 29)
    const sinceStr = since.toISOString().split('T')[0]
    const [{ data: h }, { data: c }, { data: w }] = await Promise.all([
      supabase.from('lifeos_habits').select('*').eq('user_id', user.id).eq('active', true),
      supabase.from('lifeos_habit_checks').select('*').eq('user_id', user.id).gte('date', sinceStr),
      supabase.from('lifeos_workouts').select('*').eq('user_id', user.id).gte('date', sinceStr),
    ])
    setHabits(h || [])
    setChecks(c || [])
    setWorkouts(w || [])
    setLoading(false)
  }

  function buildLast30() {
    const days = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i)
      const ds = d.toISOString().split('T')[0]
      const dayChecks = checks.filter(c => c.date === ds && c.completed).length
      const pct = habits.length > 0 ? Math.min(100, Math.round((dayChecks / habits.length) * 100)) : 0
      days.push({ day: WEEK_DAYS[d.getDay()], date: ds, pct })
    }
    return days
  }

  if (loading) return <LifeOSLayout><div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" /></div></LifeOSLayout>

  const levelInfo  = calculateLevel(profile?.total_xp || 0)
  const data30     = buildLast30()
  const avgLast7   = Math.round(data30.slice(-7).reduce((s, d) => s + d.pct, 0) / 7)
  const avgLast30  = Math.round(data30.reduce((s, d) => s + d.pct, 0) / 30)
  const perfDays   = data30.filter(d => d.pct === 100).length

  return (
    <LifeOSLayout>
      <div className="px-4 md:px-8 py-6 max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-black">Estatísticas</h1>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total XP', value: (profile?.total_xp || 0).toLocaleString(), color: GOLD },
            { label: 'Nível', value: `${levelInfo.level} — ${levelInfo.title}`, color: '#a855f7' },
            { label: 'Média 7 dias', value: `${avgLast7}%`, color: '#10b981' },
            { label: 'Dias perfeitos', value: perfDays, color: '#3b82f6' },
          ].map(s => (
            <div key={s.label} className="p-4 rounded-2xl" style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="text-xl font-black" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs mt-1" style={{ color: '#444' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* 30-day chart */}
        <div className="p-5 rounded-2xl" style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-sm" style={{ color: GOLD }}>Hábitos — Últimos 30 dias</h2>
            <span className="text-xs" style={{ color: '#555' }}>Média: {avgLast30}%</span>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={data30} barSize={6}>
              <XAxis dataKey="day" tick={{ fill: '#333', fontSize: 9 }} axisLine={false} tickLine={false} interval={6} />
              <YAxis hide domain={[0, 100]} />
              <Tooltip formatter={v => [`${v}%`, 'Conclusão']}
                contentStyle={{ background: '#111', border: '1px solid #222', borderRadius: 8, color: '#fff', fontSize: 12 }} />
              <Bar dataKey="pct" radius={[3, 3, 0, 0]}>
                {data30.map((e, i) => <Cell key={i} fill={e.pct >= 80 ? GOLD : e.pct >= 50 ? '#444' : '#222'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Workouts per week */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl" style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h2 className="font-bold text-sm mb-4" style={{ color: GOLD }}>Treinos este mês</h2>
            <div className="text-3xl font-black mb-1" style={{ color: '#3b82f6' }}>{workouts.length}</div>
            <p className="text-xs" style={{ color: '#444' }}>sessões registradas</p>
          </div>
          <div className="p-5 rounded-2xl" style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h2 className="font-bold text-sm mb-4" style={{ color: GOLD }}>Melhor streak</h2>
            <div className="text-3xl font-black mb-1" style={{ color: '#f59e0b' }}>🔥 {profile?.best_streak || 0}d</div>
            <p className="text-xs" style={{ color: '#444' }}>atual: {profile?.current_streak || 0} dias</p>
          </div>
        </div>
      </div>
    </LifeOSLayout>
  )
}
