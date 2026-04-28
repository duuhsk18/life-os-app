import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import LifeOSLayout from '@/components/lifeos/LifeOSLayout'
import { todayStr } from '@/lib/gamification'
import { Play, Pause, RotateCcw, Zap } from 'lucide-react'

const GOLD = '#F4C430'
const PRESETS = [
  { label: '25 min', minutes: 25 },
  { label: '45 min', minutes: 45 },
  { label: '60 min', minutes: 60 },
  { label: '90 min', minutes: 90 },
]

export default function LifeOSFocus() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState([])
  const [selected, setSelected] = useState(25)
  const [seconds, setSeconds]   = useState(25 * 60)
  const [running, setRunning]   = useState(false)
  const [task, setTask]         = useState('')
  const intervalRef = useRef(null)

  useEffect(() => { if (user) load() }, [user])
  useEffect(() => { setSeconds(selected * 60) }, [selected])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) { clearInterval(intervalRef.current); setRunning(false); saveSession(); return 0 }
          return s - 1
        })
      }, 1000)
    } else clearInterval(intervalRef.current)
    return () => clearInterval(intervalRef.current)
  }, [running])

  async function load() {
    const { data } = await supabase.from('lifeos_focus_sessions').select('*')
      .eq('user_id', user.id).order('created_at', { ascending: false }).limit(10)
    setSessions(data || [])
  }

  async function saveSession() {
    const elapsed = selected - Math.round(seconds / 60)
    if (elapsed < 1) return
    const { data } = await supabase.from('lifeos_focus_sessions')
      .insert({ user_id: user.id, duration_minutes: elapsed, task: task || 'Sessão de foco', date: todayStr() }).select().single()
    if (data) setSessions(p => [data, ...p])
  }

  function reset() { setRunning(false); setSeconds(selected * 60) }

  const mins = Math.floor(seconds / 60).toString().padStart(2, '0')
  const secs = (seconds % 60).toString().padStart(2, '0')
  const progress = 1 - seconds / (selected * 60)
  const totalToday = sessions.filter(s => s.date === todayStr()).reduce((a, s) => a + s.duration_minutes, 0)

  return (
    <LifeOSLayout>
      <div className="px-4 md:px-8 py-6 max-w-xl mx-auto">
        <h1 className="text-2xl font-black mb-2">Estado Flow</h1>
        <p className="text-sm mb-6" style={{ color: '#555' }}>Timer de foco profundo · {totalToday}min hoje</p>

        {/* Presets */}
        <div className="flex gap-2 mb-6">
          {PRESETS.map(p => (
            <button key={p.minutes} onClick={() => { setSelected(p.minutes); reset() }}
              className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
              style={{
                background: selected === p.minutes ? 'rgba(244,196,48,0.12)' : 'rgba(255,255,255,0.04)',
                color: selected === p.minutes ? GOLD : '#555',
                border: `1px solid ${selected === p.minutes ? 'rgba(244,196,48,0.25)' : 'rgba(255,255,255,0.06)'}`,
              }}>
              {p.label}
            </button>
          ))}
        </div>

        {/* Timer circle */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-52 h-52">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#1a1a1a" strokeWidth="4" />
              <circle cx="50" cy="50" r="45" fill="none" stroke={GOLD} strokeWidth="4"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress)}`}
                strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s linear' }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black tabular-nums">{mins}:{secs}</span>
              <span className="text-xs mt-1" style={{ color: '#444' }}>{running ? 'focando...' : 'pronto'}</span>
            </div>
          </div>
        </div>

        {/* Task input */}
        <input value={task} onChange={e => setTask(e.target.value)}
          placeholder="Em que você vai focar? (opcional)"
          className="w-full bg-transparent border rounded-xl px-4 py-3 text-sm outline-none mb-4"
          style={{ borderColor: 'rgba(255,255,255,0.08)', color: '#ccc' }} />

        {/* Controls */}
        <div className="flex gap-3">
          <button onClick={() => setRunning(r => !r)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all"
            style={{ background: running ? 'rgba(244,196,48,0.12)' : GOLD, color: running ? GOLD : '#000', border: running ? `1px solid rgba(244,196,48,0.25)` : 'none' }}>
            {running ? <><Pause className="w-5 h-5" />Pausar</> : <><Play className="w-5 h-5" />Iniciar</>}
          </button>
          <button onClick={reset} className="px-4 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', color: '#555' }}>
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* History */}
        {sessions.length > 0 && (
          <div className="mt-8">
            <h2 className="text-sm font-bold mb-3" style={{ color: GOLD }}>Sessões recentes</h2>
            <div className="space-y-2">
              {sessions.slice(0, 5).map(s => (
                <div key={s.id} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <Zap className="w-4 h-4 flex-shrink-0" style={{ color: GOLD }} />
                  <span className="flex-1 text-sm" style={{ color: '#ccc' }}>{s.task || 'Foco'}</span>
                  <span className="text-xs" style={{ color: '#555' }}>{s.duration_minutes}min</span>
                  <span className="text-xs" style={{ color: '#333' }}>{s.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </LifeOSLayout>
  )
}
