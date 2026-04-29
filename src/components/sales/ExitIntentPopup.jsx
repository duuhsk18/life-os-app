import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRelatedProducts } from '@/lib/sales-data'

export default function ExitIntentPopup({ product }) {
  const [show, setShow] = useState(false)
  const triggered = useRef(false)
  const navigate = useNavigate()
  const related = getRelatedProducts(product.slug).slice(0, 2)

  useEffect(() => {
    let lastY = window.scrollY

    const onScroll = () => {
      const currentY = window.scrollY
      if (!triggered.current && currentY < lastY - 80 && currentY < 300) {
        triggered.current = true
        setShow(true)
      }
      lastY = currentY
    }

    const onVisibility = () => {
      if (document.visibilityState === 'hidden' && !triggered.current) {
        triggered.current = true
        setShow(true)
      }
    }

    const onMouseLeave = (e) => {
      if (!triggered.current && e.clientY < 10) {
        triggered.current = true
        setShow(true)
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)
    document.addEventListener('mouseleave', onMouseLeave)
    return () => {
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('visibilitychange', onVisibility)
      document.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [])

  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setShow(false)}>
      <div
        className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-bounce-in"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={() => setShow(false)} className="float-right text-gray-400 text-2xl leading-none">&times;</button>

        <p className="text-3xl text-center mb-1">🚨</p>
        <h2 className="text-xl font-black text-center text-gray-900 mb-1">Espera! Não vai embora assim...</h2>
        <p className="text-center text-gray-600 text-sm mb-4">
          Temos uma oferta especial esperando por você.
          <br />
          <span className="font-bold text-red-600">Por apenas R$ {product.price.toFixed(2).replace('.', ',')} você leva tudo.</span>
        </p>

        <a
          href={`/checkout/${product.slug}`}
          className={`block w-full text-center bg-gradient-to-r ${product.color} text-white font-black py-3 rounded-xl text-base mb-4 shadow-lg`}
        >
          Quero garantir meu acesso agora →
        </a>

        {related.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 text-center mb-2">Ou veja outros produtos que podem te interessar:</p>
            <div className="flex gap-2">
              {related.map(p => (
                <button
                  key={p.slug}
                  onClick={() => { setShow(false); navigate(`/p/${p.slug}`) }}
                  className="flex-1 border border-gray-200 rounded-xl p-2 text-center hover:border-gray-400 transition"
                >
                  <div className="text-2xl">{p.emoji}</div>
                  <div className="text-xs text-gray-700 font-semibold leading-tight">{p.title.split('—')[0].trim()}</div>
                  <div className="text-xs text-green-600 font-bold mt-1">R$ {p.price.toFixed(2).replace('.', ',')}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        <button onClick={() => setShow(false)} className="block w-full text-center text-xs text-gray-400 mt-3 underline">
          Não, prefiro perder essa oportunidade
        </button>
      </div>
    </div>
  )
}
