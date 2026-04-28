import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const COLORS = ['#F4C430', '#FFD700', '#22c55e', '#ef4444', '#3b82f6', '#a855f7', '#f97316']

/**
 * Confetti light em framer-motion (sem deps externas).
 * Uso: <Confetti show={booleano} onDone={() => ...} />
 * Dispara ~40 partículas que voam pra cima/lateral e somem em ~1.5s.
 */
export default function Confetti({ show, onDone, count = 40 }) {
  const [particles, setParticles] = useState([])

  useEffect(() => {
    if (!show) return
    // Gera particulas ao mostrar
    const arr = Array.from({ length: count }).map((_, i) => ({
      id: i,
      color: COLORS[i % COLORS.length],
      x: (Math.random() - 0.5) * 600,
      y: -200 - Math.random() * 400,
      rot: Math.random() * 720 - 360,
      delay: Math.random() * 0.15,
      size: 8 + Math.random() * 6,
    }))
    setParticles(arr)

    const timer = setTimeout(() => {
      setParticles([])
      onDone?.()
    }, 1800)

    return () => clearTimeout(timer)
  }, [show, count, onDone])

  return (
    <AnimatePresence>
      {particles.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-[60] flex items-center justify-center overflow-hidden">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 }}
              animate={{ x: p.x, y: p.y, rotate: p.rot, opacity: 0, scale: 0.6 }}
              transition={{ duration: 1.4, delay: p.delay, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'absolute',
                width: p.size,
                height: p.size * 0.5,
                background: p.color,
                borderRadius: 2,
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  )
}
