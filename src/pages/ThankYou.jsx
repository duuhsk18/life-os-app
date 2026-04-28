import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { getProduct, PRODUCTS } from '@/lib/sales-data'
import SocialProofToast from '@/components/sales/SocialProofToast'

export default function ThankYou() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const slug = params.get('produto')
  const product = getProduct(slug)
  const allProducts = Object.values(PRODUCTS).filter(p => p.slug !== slug)

  return (
    <div className="min-h-screen bg-gray-50">
      <SocialProofToast />
      {/* Header */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-500 text-white px-4 pt-12 pb-10 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-black mb-2">Compra confirmada!</h1>
        <p className="text-white/80 text-base">
          Seu acesso foi liberado. Verifique seu e-mail em instantes.
        </p>
        {product && (
          <div className="mt-5 bg-white/20 rounded-xl p-4 inline-block">
            <p className="text-lg">{product.emoji} <span className="font-black">{product.title.split('—')[0].trim()}</span></p>
          </div>
        )}
      </div>

      {/* Access info */}
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
          <h2 className="font-black text-gray-900 mb-3">Como acessar seu produto</h2>
          <ol className="space-y-3">
            {[
              '📧 Verifique seu e-mail (caixa de entrada e spam) — em até 2 minutos chega o link de acesso',
              '🔗 Clique no link e defina sua senha (primeira vez) ou entre direto',
              '🛍 Sua área "Minha conta" mostra todos os produtos que você comprou',
              '📱 Funciona no celular, tablet ou computador — instala como app, funciona offline',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                <span className="font-black text-gray-400 flex-shrink-0">{i + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        {/* CTA: já tem conta? acessa direto */}
        <Link
          to="/minha-conta"
          className="block w-full bg-gray-900 text-white font-black text-sm py-4 rounded-2xl text-center mb-6 active:scale-95 transition-transform"
        >
          Já tenho conta — Acessar agora →
        </Link>

        {/* Upsell to Life OS */}
        <div
          onClick={() => navigate('/oto/life-os')}
          className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-5 mb-6 cursor-pointer active:scale-95 transition-transform text-center shadow-lg"
        >
          <p className="text-white font-bold text-xs uppercase tracking-widest mb-1">Recomendamos para você</p>
          <p className="text-3xl mb-2">⚡</p>
          <h3 className="text-white font-black text-lg mb-1">Life OS — Sistema Completo de Gestão</h3>
          <p className="text-white/80 text-xs mb-3">Coloque tudo em prática com gamificação, streak e acompanhamento em tempo real</p>
          <span className="bg-white text-gray-900 font-black text-sm px-5 py-2 rounded-xl">
            Ver oferta especial →
          </span>
        </div>

        {/* Cross-sell grid */}
        <h3 className="font-black text-gray-900 text-base mb-4 text-center">Aproveite e leve mais um produto</h3>
        <div className="space-y-3">
          {allProducts.slice(0, 4).map(p => (
            <button
              key={p.slug}
              onClick={() => navigate(`/p/${p.slug}`)}
              className={`w-full bg-gradient-to-r ${p.color} rounded-xl p-4 text-left flex items-center gap-3 active:scale-95 transition-transform`}
            >
              <span className="text-3xl">{p.emoji}</span>
              <div className="flex-1">
                <p className="text-white font-bold text-sm leading-tight">{p.title.split('—')[0].trim()}</p>
                <p className="text-white/70 text-xs">R$ {p.price.toFixed(2).replace('.', ',')}</p>
              </div>
              <span className="text-white text-sm">→</span>
            </button>
          ))}
        </div>

        <Link to="/catalogo" className="block text-center text-gray-500 text-sm underline mt-4 py-2">
          Ver todos os produtos
        </Link>
      </div>
    </div>
  )
}
