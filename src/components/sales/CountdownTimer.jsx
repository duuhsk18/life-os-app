import { useState, useEffect } from 'react'

export default function CountdownTimer({ minutes = 15 }) {
  const [timeLeft, setTimeLeft] = useState(minutes * 60)

  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft(t => (t <= 0 ? 0 : t - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [])

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const ss = String(timeLeft % 60).padStart(2, '0')

  return (
    <div className="bg-red-600 text-white text-center py-2 px-4">
      <p className="text-sm font-bold">
        ⚠️ OFERTA EXPIRA EM:{' '}
        <span className="font-mono text-lg">{mm}:{ss}</span>
        {' '}— Garanta seu desconto agora!
      </p>
    </div>
  )
}
