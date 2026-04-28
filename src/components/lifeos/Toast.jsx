import { createContext, useContext, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, AlertCircle, Zap, X } from 'lucide-react'

const ToastContext = createContext(null)

const ICONS = {
  success: CheckCircle2,
  error:   AlertCircle,
  xp:      Zap,
  info:    CheckCircle2,
}

const COLORS = {
  success: { bg: 'rgba(34,197,94,0.1)',  border: 'rgba(34,197,94,0.3)',  fg: '#22c55e' },
  error:   { bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.3)',  fg: '#ef4444' },
  xp:      { bg: 'rgba(244,196,48,0.1)', border: 'rgba(244,196,48,0.4)', fg: '#F4C430' },
  info:    { bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)', fg: '#3b82f6' },
}

let nextId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const remove = useCallback((id) => {
    setToasts((cur) => cur.filter((t) => t.id !== id))
  }, [])

  const push = useCallback((opts) => {
    const id = ++nextId
    const toast = {
      id,
      kind: opts.kind || 'info',
      title: opts.title || '',
      desc: opts.desc || '',
      duration: opts.duration ?? 3200,
    }
    setToasts((cur) => [...cur, toast])
    if (toast.duration > 0) {
      setTimeout(() => remove(id), toast.duration)
    }
    return id
  }, [remove])

  // Helpers de conveniência
  const value = {
    push,
    success: (title, desc) => push({ kind: 'success', title, desc }),
    error:   (title, desc) => push({ kind: 'error',   title, desc }),
    xp:      (xp, label)   => push({ kind: 'xp',      title: `+${xp} XP`, desc: label || '' }),
    info:    (title, desc) => push({ kind: 'info',    title, desc }),
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onRemove={remove} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    // Soft-fallback: se chamar fora do provider, no-op (não quebra)
    return { push: () => {}, success: () => {}, error: () => {}, xp: () => {}, info: () => {} }
  }
  return ctx
}

function ToastViewport({ toasts, onRemove }) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-[calc(100vw-2rem)] sm:w-auto pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = ICONS[t.kind]
          const c = COLORS[t.kind]
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 40, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.9 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-start gap-3 rounded-2xl px-4 py-3 backdrop-blur shadow-xl pointer-events-auto"
              style={{
                background: `${c.bg.replace('0.1', '0.95')}`,
                border: `1px solid ${c.border}`,
                backgroundColor: 'rgba(15,15,15,0.92)',
              }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: c.bg }}>
                <Icon className="w-4 h-4" style={{ color: c.fg }} />
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="font-bold text-sm" style={{ color: c.fg }}>{t.title}</div>
                {t.desc && <div className="text-xs mt-0.5" style={{ color: '#aaa' }}>{t.desc}</div>}
              </div>
              <button
                onClick={() => onRemove(t.id)}
                className="p-1 rounded-md transition opacity-50 hover:opacity-100"
                style={{ color: '#888' }}>
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
