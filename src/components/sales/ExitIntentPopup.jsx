import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRelatedProducts } from '@/lib/sales-data'

// Chave da sessão pra evitar abrir popup em toda página
const SESSION_KEY = 'exit_intent_shown_v2'

export default function ExitIntentPopup({ product }) {
  const [show, setShow] = useState(false)
  const triggered = useRef(false)
  const navigate = useNavigate()
  const related = getRelatedProducts(product.slug).slice(0, 2)

  useEffect(() => {
    // Já mostrou nessa sessão? Não mostra de novo
    try {
      if (sessionStorage.getItem(SESSION_KEY)) {
        triggered.current = true
        return
      }
    } catch (e) {}

    // Aguarda 8s antes de armar o exit intent — evita disparar enquanto a
    // pessoa ainda tá explorando a página inicial
    const armTimeout = setTimeout(() => {
      // Só dispara em mouseleave REAL (pessoa indo pra fechar/sair),
      // não em mudança de aba ou outras situações ambíguas
      const onMouseLeave = (e) => {
        // Ignora se mouse saiu pelo lado/baixo (pode ser scroll natural ou movimento normal)
        // Só dispara quando sai pra cima (área da barra do navegador)
        if (triggered.current) return
        if (e.clientY > 10) return
        // E só se não tiver elemento de destino (saiu da janela mesmo)
        if (e.relatedTarget !== null) return

        triggered.current = true
        try { sessionStorage.setItem(SESSION_KEY, '1') } catch (e) {}
        setShow(true)
      }

      document.addEventListener('mouseleave', onMouseLeave)
      return () => document.removeEventListener('mouseleave', onMouseLeave)
    }, 8000)

    return () => clearTimeout(armTimeout)
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
