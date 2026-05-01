import { useEffect, useMemo } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, Mail, Sparkles, ArrowRight, Trophy, Zap, Library } from 'lucide-react'
import { getProduct, KIT_COMPLETO, LIFE_OS } from '@/lib/sales-data'
import GarantiaBadge from '@/components/sales/GarantiaBadge'

const GOLD = '#F4C430'

const KIT_COMPLETO_SLUGS = [
  'receitas-low-carb', 'planilhas-treino', 'receitas-indigenas',
  'templates-notion', 'ebooks-autoajuda', 'planilhas-financeiras',
]

export default function ThankYou() {
  const [params] = useSearchParams()
  const navigate = useNavigate()

  // Slugs comprados (?slugs=slug1,slug2 ou ?produto=slug pra retrocompat)
  const slugs = useMemo(() => {
    const raw = params.get('slugs') || params.get('produto') || ''
    return raw.split(',').map((s) => s.trim()).filter(Boolean)
  }, [params])

  // Expande kit-completo em 6 produtos
  const expandedSlugs = useMemo(() => {
    const out = []
    for (const s of slugs) {
      if (s === 'kit-completo' || s === '__KIT_COMPLETO__') {
        out.push(...KIT_COMPLETO_SLUGS)
      } else {
        out.push(s)
      }
    }
    return [...new Set(out)]
  }, [slugs])

  const products = useMemo(() => expandedSlugs.map(getProduct).filter(Boolean), [expandedSlugs])
  const hasLifeOS = slugs.includes('life-os')
  const hasKit = slugs.includes('kit-completo') || expandedSlugs.length >= 6
  const hasOnlyOneAvulso = slugs.length === 1 && !hasLifeOS && !hasKit

  // Smart upsell strategy:
  //   - Comprou só avulso → push Kit (mesma jogada do bump pra quem não pegou)
  //   - Comprou Kit → push Life OS (recurring revenue!)
  //   - Comprou Life OS → sem upsell (tem tudo)
  const upsellTarget = hasLifeOS
    ? null
    : hasKit
    ? 'life-os'
    : 'kit-completo'

  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <div className="min-h-screen px-4 py-10 bg-gradient-to-br from-green-50 via-white to-yellow-50 text-gray-900">
      <div className="max-w-md mx-auto">

        {/* Confirmation hero */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-24 h-24 mx-auto mb-5 rounded-full flex items-center justify-center bg-green-100 border-4 border-green-500 shadow-lg">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-black mb-3 leading-tight text-gray-900">Compra confirmada!</h1>
          <p className="text-base text-gray-600">
            Seu acesso vai chegar no email em até 2 minutos.
          </p>
        </motion.div>

        {/* O que foi comprado */}
        {products.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}
            className="rounded-2xl p-5 mb-4 bg-white border border-gray-200 shadow-sm">
            <p className="text-xs uppercase tracking-widest font-bold mb-3 text-yellow-700">
              ✓ Você comprou
            </p>
            <div className="space-y-3">
              {products.map((p) => (
                <div key={p.slug} className="flex items-center gap-3">
                  {p.image ? (
                    <img src={p.image} alt={p.title}
                      className="w-12 h-15 object-cover rounded-lg flex-shrink-0 shadow-sm" style={{ aspectRatio: '4/5' }} />
                  ) : (
                    <span className="text-3xl flex-shrink-0">{p.emoji}</span>
                  )}
                  <div className="flex-1">
                    <p className="font-bold text-sm leading-tight text-gray-900">{p.title}</p>
                  </div>
                </div>
              ))}
              {hasLifeOS && (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 bg-yellow-50 border border-yellow-200">
                    <Zap className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm leading-tight text-gray-900">Life OS — Clube de Membros</p>
                    <p className="text-xs text-gray-500">R$ 59,90 · primeira mensalidade</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Como acessar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.4 }}
          className="rounded-2xl p-5 mb-4 bg-yellow-50 border border-yellow-200">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-yellow-100 border border-yellow-300">
              <Mail className="w-4 h-4 text-yellow-700" />
            </div>
            <div>
              <h3 className="font-black text-sm text-gray-900">Cheque seu email</h3>
              <p className="text-xs text-gray-600">
                Vem do <strong>noreply@agenciacriativa.shop</strong>
              </p>
            </div>
          </div>
          <ol className="text-xs space-y-1.5 leading-relaxed pl-3 text-gray-700">
            <li><strong className="text-gray-900">1.</strong> Procura também em Spam e Promoções (Gmail)</li>
            <li><strong className="text-gray-900">2.</strong> Clica no botão "Acessar minha área"</li>
            <li><strong className="text-gray-900">3.</strong> Você cai logado em /minha-conta</li>
            <li><strong className="text-gray-900">4.</strong> Defina uma senha pra próximos logins serem instantâneos</li>
          </ol>
          <Link to="/minha-conta"
            className="block mt-4 text-center w-full py-2.5 rounded-xl text-xs font-bold transition active:scale-95 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50">
            Já clicou? Acessa direto →
          </Link>
        </motion.div>

        {/* SMART UPSELL */}
        {upsellTarget === 'life-os' && (
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.5 }}
            className="rounded-2xl overflow-hidden mb-4 relative"
            style={{ background: 'linear-gradient(135deg, #1a1305, #0a0a0a)', border: '2px solid rgba(244,196,48,0.4)' }}>
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20 blur-3xl" style={{ background: GOLD }} />
            <div className="relative p-5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black mb-3 uppercase tracking-widest"
                style={{ background: GOLD, color: '#000' }}>
                <Trophy className="w-3 h-3" /> Oferta especial
              </div>
              <h3 className="font-black text-xl mb-2 leading-tight">
                Quer levar o sistema <span style={{ color: GOLD }}>Life OS</span> também?
              </h3>
              <p className="text-sm mb-4" style={{ color: '#bbb' }}>
                Já que você levou o Kit, completa com o app gamificado: hábitos com XP, treinos, journal, finanças. Materiais novos todo mês.
              </p>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-sm line-through" style={{ color: '#666' }}>R$ 79,90/mês</span>
                <span className="font-black text-2xl" style={{ color: GOLD }}>R$ 59,90</span>
                <span className="text-xs" style={{ color: '#888' }}>1º mês com cupom <strong>LANCAMENTO</strong></span>
              </div>
              <button
                onClick={() => navigate('/checkout/life-os')}
                className="w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition"
                style={{ background: GOLD, color: '#000' }}>
                Adicionar Life OS <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[11px] text-center mt-2" style={{ color: '#666' }}>
                Cancela quando quiser, sem multa
              </p>
            </div>
          </motion.div>
        )}

        {upsellTarget === 'kit-completo' && (
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.5 }}
            className="rounded-2xl overflow-hidden mb-4"
            style={{ background: 'linear-gradient(135deg, #c2410c, #ea580c)' }}>
            <div className="p-5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black mb-3 uppercase tracking-widest bg-white/20 text-white">
                <Library className="w-3 h-3" /> Aproveita e leve tudo
              </div>
              <h3 className="text-white font-black text-xl mb-2 leading-tight">
                +R$ 19,10 e você leva os <strong>6 produtos</strong>
              </h3>
              <p className="text-white/80 text-sm mb-4">
                Em vez de só este, completa com: Receitas Low Carb + Treinos + Indígenas + Templates + Ebooks + Financeiras. Tudo vitalício.
              </p>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-white/60 text-sm line-through">R$ 167,40 (separado)</span>
                <span className="font-black text-2xl text-white">R$ 47</span>
              </div>
              <button
                onClick={() => navigate('/checkout/kit-completo')}
                className="w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition bg-white text-gray-900">
                Quero o Kit Completo <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Garantia (sempre) */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="flex justify-center mt-6">
          <GarantiaBadge />
        </motion.div>

        <p className="text-center mt-6 text-xs">
          <Link to="/" style={{ color: '#666' }}>← Voltar pra página inicial</Link>
        </p>
      </div>
    </div>
  )
}
