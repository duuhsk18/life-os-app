import { useEffect, useState } from 'react'
import { Tag } from 'lucide-react'

const GOLD = '#F4C430'

// Cupom expira no fim do dia 10/05/2026 (horário Brasil = UTC-3)
const DEADLINE_ISO = '2026-05-10T23:59:59-03:00'

function timeLeft() {
  const diff = new Date(DEADLINE_ISO).getTime() - Date.now()
  if (diff <= 0) return null
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  return { days, hours, minutes }
}

export default function EscassezBanner() {
  const [t, setT] = useState(timeLeft())

  useEffect(() => {
    const id = setInterval(() => setT(timeLeft()), 60000)
    return () => clearInterval(id)
  }, [])

  if (!t) return null

  const dl = new Date(DEADLINE_ISO).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })

  return (
    <div className="relative overflow-hidden"
      style={{ background: 'linear-gradient(90deg, #1a1305 0%, #0a0a0a 50%, #1a1305 100%)', borderBottom: '1px solid rgba(244,196,48,0.2)' }}>
      <div className="max-w-5xl mx-auto px-4 py-2 flex items-center justify-center gap-3 text-xs sm:text-sm flex-wrap">
        <span className="inline-flex items-center gap-1.5 font-bold" style={{ color: GOLD }}>
          <Tag className="w-3.5 h-3.5" />
          LANÇAMENTO
        </span>
        <span style={{ color: '#ccc' }}>
          Cupom <strong style={{ color: GOLD }}>LANCAMENTO</strong> ativo no Life OS · primeiro mês <strong style={{ color: GOLD }}>R$59,90</strong> em vez de R$79,90
        </span>
        <span className="hidden sm:inline" style={{ color: '#666' }}>·</span>
        <span className="font-mono font-bold" style={{ color: '#fbbf24' }}>
          {t.days > 0 && `${t.days}d `}
          {String(t.hours).padStart(2, '0')}:{String(t.minutes).padStart(2, '0')}
        </span>
        <span style={{ color: '#666' }}>até {dl}</span>
      </div>
    </div>
  )
}
