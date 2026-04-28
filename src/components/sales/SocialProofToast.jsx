import { useState, useEffect, useCallback } from 'react'
import { randomEntry } from '@/lib/social-proof-data'

export default function SocialProofToast() {
  const [entry, setEntry]   = useState(null)
  const [visible, setVisible] = useState(false)

  const show = useCallback(() => {
    setEntry(randomEntry())
    setVisible(true)
    setTimeout(() => setVisible(false), 5000)
  }, [])

  useEffect(() => {
    // first pop after 8-15s
    const first = setTimeout(show, 8000 + Math.random() * 7000)
    return () => clearTimeout(first)
  }, [show])

  useEffect(() => {
    if (!visible) {
      // next pop 20-40s after hiding
      const next = setTimeout(show, 20000 + Math.random() * 20000)
      return () => clearTimeout(next)
    }
  }, [visible, show])

  if (!entry) return null

  return (
    <div
      className="fixed bottom-24 left-3 z-50 transition-all duration-500"
      style={{
        transform: visible ? 'translateX(0)' : 'translateX(-120%)',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-3 flex items-start gap-3 max-w-[240px]">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
          {entry.name.charAt(0)}
        </div>
        <div className="min-w-0">
          <p className="font-bold text-gray-900 text-xs leading-tight truncate">{entry.name}</p>
          <p className="text-gray-500 text-xs leading-tight">
            acabou de comprar
          </p>
          <p className="text-green-600 font-bold text-xs leading-tight">{entry.product}</p>
          <p className="text-gray-400 text-[10px] mt-0.5">{entry.city}</p>
        </div>
        <button
          onClick={() => setVisible(false)}
          className="text-gray-300 hover:text-gray-500 text-xs flex-shrink-0 leading-none mt-0.5"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
