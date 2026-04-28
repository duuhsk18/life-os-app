import { useNavigate, useSearchParams } from 'react-router-dom'
import { LIFE_OS } from '@/lib/sales-data'
import SocialProofToast from '@/components/sales/SocialProofToast'

function Stars({ n = 5 }) {
  return <span className="text-yellow-400">{'★'.repeat(n)}</span>
}

export default function OTOPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const fromProduct = params.get('de') || 'seu produto'

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <SocialProofToast />
      {/* Urgency bar */}
      <div className="bg-yellow-500 text-gray-900 text-center py-2 px-4">
        <p className="text-sm font-black">⚡ OFERTA ÚNICA — Aparece apenas 1 vez. Não vai aparecer de novo.</p>
      </div>

      <div className="max-w-lg mx-auto px-4 py-10">
        {/* Confirmation */}
        <div className="bg-green-800/40 border border-green-500 rounded-xl p-4 mb-8 text-center">
          <p className="text-green-400 font-bold text-sm">✓ Pagamento confirmado! Seu acesso está sendo liberado.</p>
        </div>

        {/* Hero */}
        <div className="text-center mb-8">
          <p className="text-yellow-400 text-xs font-bold uppercase tracking-widest mb-3">Espera! Antes de continuar...</p>
          <div className="text-6xl mb-4">{LIFE_OS.emoji}</div>
          <h1 className="text-2xl font-black mb-3 leading-tight">{LIFE_OS.title}</h1>
          <p className="text-gray-300 text-sm leading-relaxed">{LIFE_OS.description}</p>
        </div>

        {/* Features */}
        <div className="bg-gray-900 rounded-2xl p-5 mb-6">
          <p className="text-yellow-400 font-bold text-sm mb-4 text-center">Tudo que o Life OS tem:</p>
          <div className="space-y-2">
            {LIFE_OS.features.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-yellow-400 text-lg">⚡</span>
                <p className="text-gray-200 text-sm">{f}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Price */}
        <div className="bg-gradient-to-br from-yellow-600 to-orange-600 rounded-2xl p-6 mb-6 text-center">
          <p className="text-white/80 text-sm mb-1">Oferta exclusiva para quem acabou de comprar</p>
          <p className="text-white/60 line-through text-sm">De R$ {LIFE_OS.originalPrice.toFixed(2).replace('.', ',')}/mês</p>
          <p className="text-5xl font-black text-white my-2">
            R$ {LIFE_OS.price.toFixed(2).replace('.', ',')}
          </p>
          <p className="text-white/80 text-sm">no 1º mês — depois R$ {LIFE_OS.originalPrice.toFixed(2).replace('.', ',')}/mês</p>
        </div>

        {/* Testimonials */}
        <div className="space-y-3 mb-8">
          {[
            { name: 'Gabriela M.', text: 'O Life OS transformou minha rotina. Uso todo dia há 3 meses!', avatar: '👩‍💻' },
            { name: 'Lucas F.', text: 'A gamificação me mantém motivado. Nunca fui tão consistente nos hábitos.', avatar: '👨' },
          ].map((t, i) => (
            <div key={i} className="bg-gray-900 rounded-xl p-4">
              <Stars />
              <p className="text-gray-300 text-sm mt-2">"{t.text}"</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xl">{t.avatar}</span>
                <p className="text-gray-400 text-xs font-bold">{t.name}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <a
          href={LIFE_OS.checkoutUrl}
          className="block w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-gray-900 font-black py-5 rounded-2xl text-xl text-center shadow-2xl active:scale-95 transition-transform mb-4"
        >
          Quero o Life OS por R$ {LIFE_OS.price.toFixed(2).replace('.', ',')} →
        </a>

        <button
          onClick={() => navigate('/obrigado')}
          className="block w-full text-center text-gray-500 text-sm underline py-2"
        >
          Não, obrigado. Quero ir para meu conteúdo
        </button>
      </div>
    </div>
  )
}
