import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import LifeOSLayout from '@/components/lifeos/LifeOSLayout'
import { calculateLevel, xpToNextLevel, todayStr } from '@/lib/gamification'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { TrendingUp, Zap, Dumbbell, Clock, CheckSquare, Target } from 'lucide-react'

const GOLD = '#F4C430'
const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export default function LifeOSDashboard() {
  const { user, profile, refreshProfile } = useAuth()
  const [habits, setHabits]       = useState([])
  const [todayChecks, setTodayChecks] = useState([])
  const [allChecks, setAllChecks] = useState([])
  const [workouts, setWorkouts]   = useState([])
  const [weekData, setWeekData]   = useState([])
  const [goals, setGoals]         = useState([])
  const [loading, setLoading]     = useState(true)
  const today = todayStr()

  useEffect(() => { if (user) loadAll() }, [user])

  async function loadAll() {
    try {
      const [{ data: habitList }, { data: allC }, { data: wkts }, { data: goalList }] = await Promise.all([
        supabase.from('lifeos_habits').select('*').eq('user_id', user.id).eq('active', true),
        supabase.from('lifeos_habit_checks').select('*').eq('user_id', user.id),
        supabase.from('lifeos_workouts').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('lifeos_goals').select('*').eq('user_id', user.id).eq('status', 'active').limit(3),
      ])
      setHabits(habitList || [])
      setTodayChecks((allC || []).filter(c => c.date === today))
      setAllChecks(allC || [])
      setWorkouts(wkts || [])
      setGoals(goalList || [])
      buildWeekData(allC || [], habitList || [])
    } finally { setLoading(false) }
  }

  function buildWeekData(allC, habitList) {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i)
      const ds = d.toISOString().split('T')[0]
      const dayChecks = allC.filter(c => c.date === ds && c.completed).length
      const pct = habitList.length > 0 ? Math.min(100, Math.round((dayChecks / habitList.length) * 100)) : 0
      days.push({ day: WEEK_DAYS[d.getDay()], pct, isToday: i === 0 })
    }
    setWeekData(days)
  }

  async function toggleHabit(habit) {
    const existing = todayChecks.find(c => c.habit_id === habit.id)
    if (existing) {
      await supabase.from('lifeos_habit_checks').delete().eq('id', existing.id)
      setTodayChecks(prev => prev.filter(c => c.id !== existing.id))
      const newXp = Math.max(0, (profile?.total_xp || 0) - habit.xp_reward)
      await supabase.from('lifeos_profiles').update({ total_xp: newXp }).eq('id', user.id)
      refreshProfile()
    } else {
      const { data: newCheck } = await supabase.from('lifeos_habit_checks').insert({
        user_id: user.id, habit_id: habit.id, date: today, completed: true
      }).select().single()
      if (newCheck) setTodayChecks(prev => [...prev, newCheck])
      const newXp = (profile?.total_xp || 0) + habit.xp_reward
      await supabase.from('lifeos_profiles').update({ total_xp: newXp }).eq('id', user.id)
      refreshProfile()
    }
  }

  if (loading) return (
    <LifeOSLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    </LifeOSLayout>
  )

  const levelInfo = calculateLevel(profile?.total_xp || 0)
  const xpInfo    = xpToNextLevel(profile?.total_xp || 0)
  const completedToday = todayChecks.filter(c => c.completed).length
  const totalHabits = habits.length
  const pct = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0

  return (
    <LifeOSLayout>
      <div className="px-4 md:px-8 py-6 max-w-5xl mx-auto space-y-6">

        {/* XP Hero */}
        <div className="rounded-2xl p-6" style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: GOLD }}>Progresso de Hoje</p>
              <h1 className="text-4xl font-black">{profile?.total_xp || 0} <span className="text-2xl" style={{ color: GOLD }}>XP</span></h1>
              <p className="text-sm mt-1" style={{ color: '#555' }}>{completedToday}/{totalHabits} hábitos concluídos hoje</p>
            </div>
            <div className="flex gap-4 text-center">
              <div>
                <div className="text-xl font-black" style={{ color: GOLD }}>{profile?.total_xp || 0}</div>
                <div className="text-xs" style={{ color: '#444' }}>XP Total</div>
              </div>
              <div>
                <div className="text-xl font-black" style={{ color: GOLD }}>🏆</div>
                <div className="text-xs" style={{ color: '#444' }}>{levelInfo.title}</div>
              </div>
            </div>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#1a1a1a' }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${xpInfo.percent}%`, background: `linear-gradient(90deg, ${GOLD}, #FFD700)` }} />
          </div>
          <div className="flex justify-between text-xs mt-1" style={{ color: '#444' }}>
            <span>Nível {levelInfo.level}</span>
            <span>{xpInfo.isMaxLevel ? 'Nível máximo!' : `${xpInfo.xpNeeded} XP para o próximo nível`}</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: TrendingUp, label: 'Conclusão hoje', value: `${pct}%`, color: '#10b981' },
            { icon: Dumbbell,   label: 'Treinos',        value: workouts.length, color: '#3b82f6' },
            { icon: Zap,        label: 'Streak atual',   value: `${profile?.current_streak || 0}d`, color: GOLD },
            { icon: Target,     label: 'Metas ativas',   value: goals.length, color: '#a855f7' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-4" style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)' }}>
              <s.icon className="w-4 h-4 mb-2" style={{ color: s.color }} />
              <div className="text-xl font-black" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs mt-0.5" style={{ color: '#444' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Habits today */}
          <div className="rounded-2xl p-5" style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-sm" style={{ color: GOLD }}>Hábitos de Hoje</h2>
                <p className="text-xs" style={{ color: '#444' }}>{completedToday}/{totalHabits} concluídos</p>
              </div>
              <Link to="/membros/habitos" className="text-xs px-3 py-1.5 rounded-xl font-semibold"
                style={{ background: 'rgba(244,196,48,0.1)', color: GOLD, border: '1px solid rgba(244,196,48,0.2)' }}>
                Ver todos →
              </Link>
            </div>
            {habits.length === 0 ? (
              <Link to="/membros/habitos" className="block text-center py-6 text-sm" style={{ color: '#444' }}>
                Adicione seus primeiros hábitos →
              </Link>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {habits.slice(0, 6).map(habit => {
                  const done = todayChecks.some(c => c.habit_id === habit.id && c.completed)
                  return (
                    <button key={habit.id} onClick={() => toggleHabit(habit)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left"
                      style={{ background: done ? 'rgba(244,196,48,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${done ? 'rgba(244,196,48,0.2)' : 'rgba(255,255,255,0.05)'}` }}>
                      <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                        style={{ borderColor: done ? GOLD : '#333', background: done ? GOLD : 'transparent' }}>
                        {done && <span className="text-black text-xs font-black">✓</span>}
                      </div>
                      <span className="text-sm flex-1" style={{ color: done ? '#888' : '#ccc', textDecoration: done ? 'line-through' : 'none' }}>
                        {habit.icon} {habit.name}
                      </span>
                      <span className="text-xs font-bold" style={{ color: done ? GOLD : '#333' }}>+{habit.xp_reward} XP</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Weekly chart */}
          <div className="rounded-2xl p-5" style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h2 className="font-bold text-sm mb-1" style={{ color: GOLD }}>Desempenho Semanal</h2>
            <p className="text-xs mb-4" style={{ color: '#444' }}>Últimos 7 dias</p>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={weekData} barSize={18}>
                <XAxis dataKey="day" tick={{ fill: '#444', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip formatter={v => [`${v}%`, 'Conclusão']}
                  contentStyle={{ background: '#111', border: '1px solid #222', borderRadius: 8, color: '#fff', fontSize: 12 }} />
                <Bar dataKey="pct" radius={[4, 4, 0, 0]}>
                  {weekData.map((entry, i) => (
                    <Cell key={i} fill={entry.isToday ? GOLD : entry.pct >= 80 ? '#22c55e' : entry.pct >= 50 ? '#f59e0b' : '#222'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex justify-between text-xs mt-2" style={{ color: '#444' }}>
              <span>Média semanal</span>
              <span style={{ color: GOLD }}>{weekData.length > 0 ? Math.round(weekData.reduce((s, d) => s + d.pct, 0) / weekData.length) : 0}%</span>
            </div>
          </div>
        </div>

        {/* Active goals */}
        {goals.length > 0 && (
          <div className="rounded-2xl p-5" style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-sm" style={{ color: GOLD }}>Metas Ativas</h2>
              <Link to="/membros/metas" className="text-xs" style={{ color: '#555' }}>Ver todas →</Link>
            </div>
            <div className="space-y-3">
              {goals.map(goal => (
                <div key={goal.id} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: GOLD }} />
                  <span className="text-sm flex-1" style={{ color: '#ccc' }}>{goal.title}</span>
                  <div className="text-xs" style={{ color: '#444' }}>{goal.progress || 0}%</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </LifeOSLayout>
  )
}
