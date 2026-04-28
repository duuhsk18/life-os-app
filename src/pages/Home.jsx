import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, CheckSquare, Dumbbell, BookOpen, DollarSign, Zap, Library, Trophy, Sparkles, Shield, ChevronDown } from 'lucide-react'
import { PRODUCTS, KIT_COMPLETO, LIFE_OS } from '@/lib/sales-data'
import CartButton from '@/components/sales/CartButton'
import CartDrawer from '@/components/sales/CartDrawer'
import SocialProofToast from '@/components/sales/SocialProofToast'
import { useCart } from '@/contexts/CartContext'

const GOLD = '#F4C430'

const STATS = [
  { number: '+1.200',  label: 'alunos transformados' },
  { number: '4.9/5',   label: 'avaliação média' },
  { number: '+120',    label: 'materiais inclusos' },
  { number: '7 dias',  label: 'garantia incondicional' },
]

const LIFE_OS_FEATURES = [
  { icon: CheckSquare, label: 'Hábitos com XP',     color: '#10b981' },
  { icon: Dumbbell,    label: 'Treinos & evolução', color: '#3b82f6' },
  { icon: Zap,         label: 'Foco / Pomodoro',    color: GOLD },
  { icon: BookOpen,    label: 'Journal & gratidão', color: '#a855f7' },
  { icon: DollarSign,  label: 'Finanças integradas', color: '#22c55e' },
  { icon: Library,     label: 'Biblioteca completa', color: '#f59e0b' },
]

const TESTIMONIALS = [
  { name: 'Juliana M.', city: 'São Paulo, SP', text: 'Em 60 dias perdi 7 kg e tenho controle dos meus gastos. Tudo num app só.', rating: 5 },
  { name: 'Rafaela S.', city: 'Curitiba, PR', text: 'O sistema de XP me vicia. Nunca mantive hábitos por tanto tempo.', rating: 5 },
  { name: 'Camila P.',  city: 'Belo Horizonte, MG', text: 'Melhor R$27 que já gastei. Uso todos os dias. Recomendo de olhos fechados.', rating: 5 },
  { name: 'Eduardo K.', city: 'Curitiba, PR', text: 'As planilhas financeiras me tiraram do vermelho em 4 meses. Inacreditável.', rating: 5 },
]

const FAQ = [
  { q: 'Qual a diferença entre comprar avulso, o Kit e o Life OS?',
    a: 'Avulso: 1 produto vitalício por R$27,90. Kit: os 6 produtos vitalícios por R$47. Life OS: tudo isso + sistema gamificado + materiais novos todo mês por assinatura mensal.' },
  { q: 'Tenho acesso pra sempre depois de comprar?',
    a: 'Avulso e Kit são vitalícios — paga uma vez e usa pra sempre. Life OS é assinatura mensal, cancele quando quiser sem multa.' },
  { q: 'Como recebo o material após pagar?',
    a: 'Em segundos você recebe um e-mail com link mágico. Clica e cai direto na sua área de membros com tudo liberado. Sem senha.' },
  { q: 'Funciona no celular?',
    a: 'Sim. Todos os produtos são PWA — você instala como app na tela do celular e funciona offline depois.' },
  { q: 'E se eu não gostar?',
    a: 'Garantia incondicional de 7 dias em qualquer produto. Devolvemos 100% sem perguntas.' },
  { q: 'Posso comprar mais de um produto avulso?',
    a: 'Pode, mas a partir do 3º faz mais sentido pegar o Kit Completo (R$47, 6 produtos). E pra evolução real, o Life OS.' },
]

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.5, ease: 'easeOut' },
}

const staggerContainer = {
  initial: {},
  whileInView: {},
  viewport: { once: true, margin: '-50px' },
  transition: { staggerChildren: 0.08 },
}

const staggerItem = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: 'easeOut' },
}

export default function Home() {
  const navigate = useNavigate()
  const { addItem, hasItem, items } = useCart()
  const products = Object.values(PRODUCTS)
  const cartFull = items.length >= 3
  const [openFaq, setOpenFaq] = useState(null)

  return (
    <div className="min-h-screen" style={{ background: '#000', color: '#fff' }}>
      <SocialProofToast />
      <CartButton />
      <CartDrawer />

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b sticky top-0 z-30 backdrop-blur"
        style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.7)' }}>
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black" style={{ background: GOLD, color: '#000' }}>L</div>
          <span className="font-black tracking-tight">Life OS</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link to="/catalogo" className="hidden sm:inline px-4 py-2 rounded-xl text-sm font-bold text-white/70 hover:text-white transition">
            Catálogo
          </Link>
          <Link to="/login" className="px-4 py-2 rounded-xl text-sm font-bold transition"
            style={{ background: 'rgba(244,196,48,0.1)', color: GOLD, border: '1px solid rgba(244,196,48,0.2)' }}>
            Entrar
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <motion.section {...fadeUp} className="text-center px-6 pt-16 pb-12 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-6"
          style={{ background: 'rgba(244,196,48,0.1)', color: GOLD, border: '1px solid rgba(244,196,48,0.2)' }}>
          <Sparkles className="w-3.5 h-3.5" /> 6 produtos digitais · 1 sistema completo
        </div>
        <h1 className="text-4xl md:text-6xl font-black leading-[1.05] mb-6 tracking-tight">
          Transforme sua rotina<br />
          <span style={{ color: GOLD }}>uma área de cada vez</span>
        </h1>
        <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto" style={{ color: '#999' }}>
          Hábitos, treinos, finanças, alimentação, foco e mentalidade — em planilhas, ebooks e templates testados na prática. Comece avulso ou pegue tudo.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
          <button
            onClick={() => document.getElementById('produtos')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-base active:scale-95 transition"
            style={{ background: GOLD, color: '#000' }}>
            Ver os produtos <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => document.getElementById('life-os')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-4 rounded-2xl font-bold text-sm transition"
            style={{ background: 'rgba(255,255,255,0.05)', color: '#ccc', border: '1px solid rgba(255,255,255,0.1)' }}>
            Conhecer o Life OS ⚡
          </button>
        </div>

        {/* Stats */}
        <motion.div variants={staggerContainer} initial="initial" whileInView="whileInView" viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto pt-4">
          {STATS.map((s) => (
            <motion.div key={s.label} variants={staggerItem}
              className="p-4 rounded-xl text-center"
              style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="text-xl md:text-2xl font-black mb-0.5" style={{ color: GOLD }}>{s.number}</div>
              <div className="text-[11px] md:text-xs uppercase tracking-wider" style={{ color: '#666' }}>{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* 3 Tiers */}
      <motion.section {...fadeUp} className="px-4 py-16 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: GOLD }}>3 caminhos</p>
          <h2 className="text-3xl md:text-4xl font-black mb-2">Escolha sua transformação</h2>
          <p className="text-sm" style={{ color: '#888' }}>Do mais barato ao mais completo — todos com 7 dias de garantia</p>
        </div>

        <motion.div variants={staggerContainer} initial="initial" whileInView="whileInView" viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-4">
          {/* Tier 1: Avulso */}
          <motion.div variants={staggerItem}
            className="rounded-2xl p-6 flex flex-col"
            style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-xs uppercase tracking-widest font-bold mb-3" style={{ color: '#666' }}>Avulso</p>
            <h3 className="font-black text-xl mb-1">1 Produto</h3>
            <p className="text-xs mb-5" style={{ color: '#888' }}>Pra quem quer testar 1 produto específico.</p>
            <div className="mb-5">
              <p className="text-3xl font-black">R$ 27,90</p>
              <p className="text-xs" style={{ color: '#666' }}>vitalício · sem mensalidade</p>
            </div>
            <ul className="space-y-2 text-sm mb-6 flex-1" style={{ color: '#ccc' }}>
              <li className="flex items-start gap-2"><span style={{ color: '#666' }}>✓</span> 1 produto à sua escolha</li>
              <li className="flex items-start gap-2"><span style={{ color: '#666' }}>✓</span> PWA: instala como app</li>
              <li className="flex items-start gap-2"><span style={{ color: '#666' }}>✓</span> Funciona offline</li>
              <li className="flex items-start gap-2"><span style={{ color: '#666' }}>✓</span> Acesso vitalício</li>
            </ul>
            <button
              onClick={() => document.getElementById('produtos')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full py-3 rounded-xl text-sm font-bold transition active:scale-95"
              style={{ background: 'rgba(255,255,255,0.06)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>
              Ver produtos ↓
            </button>
          </motion.div>

          {/* Tier 2: Kit Completo */}
          <motion.div variants={staggerItem}
            className="rounded-2xl p-6 flex flex-col bg-gradient-to-br from-orange-600 to-amber-600 shadow-xl border border-orange-400">
            <p className="text-xs uppercase tracking-widest font-bold mb-3 text-white/90">Kit Completo</p>
            <h3 className="text-white font-black text-xl mb-1">6 Produtos</h3>
            <p className="text-white/80 text-xs mb-5">Pra quem quer tudo, sem mensalidade.</p>
            <div className="mb-5">
              <p className="text-white/70 text-sm line-through">De R$ {KIT_COMPLETO.totalValue.toFixed(2).replace('.', ',')}</p>
              <p className="text-3xl font-black text-white">R$ 47,00</p>
              <p className="text-white/80 text-xs">vitalício · economize 72%</p>
            </div>
            <ul className="space-y-2 text-sm text-white mb-6 flex-1">
              <li className="flex items-start gap-2"><span className="text-yellow-200">✓</span> Todos os 6 produtos</li>
              <li className="flex items-start gap-2"><span className="text-yellow-200">✓</span> PWA + offline</li>
              <li className="flex items-start gap-2"><span className="text-yellow-200">✓</span> Acesso vitalício</li>
              <li className="flex items-start gap-2"><span className="text-white/40">✗</span> <span className="text-white/40">Sistema gamificado</span></li>
              <li className="flex items-start gap-2"><span className="text-white/40">✗</span> <span className="text-white/40">Novos materiais</span></li>
            </ul>
            <a
              href={KIT_COMPLETO.checkoutUrl}
              className="w-full bg-white text-gray-900 font-black py-3 rounded-xl text-sm text-center active:scale-95 transition">
              Quero o Kit →
            </a>
          </motion.div>

          {/* Tier 3: Life OS */}
          <motion.div variants={staggerItem}
            className="rounded-2xl p-6 flex flex-col bg-gradient-to-br from-yellow-500 to-amber-500 shadow-2xl border-2 border-yellow-300 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest border"
              style={{ background: '#000', color: GOLD, borderColor: GOLD }}>
              ⚡ Mais vendido
            </div>
            <p className="text-gray-900/80 text-xs uppercase tracking-widest font-bold mb-3">Life OS</p>
            <h3 className="text-gray-900 font-black text-xl mb-1">Tudo + Sistema</h3>
            <p className="text-gray-900/80 text-xs mb-5">Pra quem quer evoluir todo dia.</p>
            <div className="mb-5">
              <p className="text-gray-900/70 text-sm line-through">De R$ {LIFE_OS.originalPrice.toFixed(2).replace('.', ',')}/mês</p>
              <p className="text-3xl font-black text-gray-900">R$ 59,90</p>
              <p className="text-gray-900/90 text-xs font-bold">no 1º mês — depois R$ 79,90/mês</p>
            </div>
            <ul className="space-y-2 text-sm text-gray-900 mb-6 flex-1">
              <li className="flex items-start gap-2"><span className="font-black">✓</span> <strong>Todos os 6 produtos</strong></li>
              <li className="flex items-start gap-2"><span className="font-black">✓</span> <strong>App gamificado</strong></li>
              <li className="flex items-start gap-2"><span className="font-black">✓</span> <strong>Materiais novos /mês</strong></li>
              <li className="flex items-start gap-2"><span className="font-black">✓</span> Hábitos, treinos, journal</li>
              <li className="flex items-start gap-2"><span className="font-black">✓</span> Cancele quando quiser</li>
            </ul>
            <a
              href={LIFE_OS.checkoutUrl}
              className="w-full font-black py-3 rounded-xl text-sm text-center active:scale-95 transition shadow-lg"
              style={{ background: '#000', color: GOLD }}>
              Assinar Life OS →
            </a>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Produtos individuais */}
      <motion.section {...fadeUp} id="produtos" className="px-4 py-16 max-w-5xl mx-auto scroll-mt-20">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: GOLD }}>Os 6 produtos</p>
          <h2 className="text-3xl md:text-4xl font-black mb-2">Cada um vale por si</h2>
          <p className="text-sm" style={{ color: '#888' }}>R$ 27,90 cada · vitalício · acesso imediato</p>
        </div>

        <motion.div variants={staggerContainer} initial="initial" whileInView="whileInView" viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => {
            const inCart = hasItem(p.slug)
            return (
              <motion.div key={p.slug} variants={staggerItem} whileHover={{ scale: 1.01 }}
                className={`bg-gradient-to-br ${p.color} rounded-2xl p-5 shadow-lg cursor-pointer`}
                onClick={() => navigate(`/p/${p.slug}`)}>
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-4xl flex-shrink-0">{p.emoji}</span>
                  <div className="flex-1 min-w-0">
                    {p.badge && (
                      <span className="inline-block bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mb-1.5 uppercase tracking-wide">
                        {p.badge}
                      </span>
                    )}
                    <h3 className="text-white font-black text-base leading-tight mb-1 line-clamp-2">{p.title}</h3>
                  </div>
                </div>
                <p className="text-white/80 text-xs leading-relaxed line-clamp-2 mb-4">{p.subtitle}</p>
                <div className="flex items-end justify-between mb-3">
                  <div>
                    <span className="text-white/50 text-xs line-through block">R$ {p.originalPrice.toFixed(2).replace('.', ',')}</span>
                    <span className="text-white font-black text-2xl">R$ {p.price.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <span className="bg-white text-gray-900 font-black text-xs px-3 py-1.5 rounded-lg">
                    Ver →
                  </span>
                </div>
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <a
                    href={p.checkoutUrl}
                    className="flex-1 bg-white/20 border border-white/40 text-white font-bold py-2 rounded-lg text-center text-xs hover:bg-white/30 transition">
                    Comprar
                  </a>
                  <button
                    onClick={() => addItem(p)}
                    disabled={inCart || cartFull}
                    className={`flex-1 font-bold py-2 rounded-lg text-xs transition active:scale-95 ${
                      inCart
                        ? 'bg-white/10 text-white/60 cursor-default'
                        : cartFull
                        ? 'bg-white/10 text-white/40 cursor-not-allowed'
                        : 'bg-white text-gray-900 hover:bg-white/90'
                    }`}>
                    {inCart ? '✓ No carrinho' : '🛒 Carrinho'}
                  </button>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </motion.section>

      {/* Life OS Spotlight */}
      <motion.section {...fadeUp} id="life-os" className="px-4 py-16 max-w-5xl mx-auto scroll-mt-20">
        <div className="rounded-3xl p-8 md:p-12 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1a1305 0%, #0a0a0a 70%)', border: '1px solid rgba(244,196,48,0.2)' }}>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20 blur-3xl" style={{ background: GOLD }} />
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-4"
              style={{ background: 'rgba(244,196,48,0.15)', color: GOLD, border: '1px solid rgba(244,196,48,0.3)' }}>
              <Trophy className="w-3.5 h-3.5" /> O plano completo
            </div>
            <h2 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
              Life OS — o sistema<br />
              <span style={{ color: GOLD }}>que faz tudo conversar</span>
            </h2>
            <p className="text-base md:text-lg mb-8 max-w-2xl" style={{ color: '#aaa' }}>
              Os 6 produtos + um app gamificado pra rastrear hábitos, treinos, finanças e foco. Você vê sua evolução em tempo real e ganha XP por cada vitória.
            </p>

            <motion.div variants={staggerContainer} initial="initial" whileInView="whileInView" viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
              {LIFE_OS_FEATURES.map((f) => (
                <motion.div key={f.label} variants={staggerItem}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${f.color}20` }}>
                    <f.icon className="w-4.5 h-4.5" style={{ color: f.color }} />
                  </div>
                  <span className="text-sm font-semibold">{f.label}</span>
                </motion.div>
              ))}
            </motion.div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <a
                href={LIFE_OS.checkoutUrl}
                className="flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-base active:scale-95 transition"
                style={{ background: GOLD, color: '#000' }}>
                Assinar Life OS <ArrowRight className="w-5 h-5" />
              </a>
              <div className="text-sm">
                <div style={{ color: GOLD }} className="font-black">R$ 59,90 no 1º mês</div>
                <div style={{ color: '#888' }} className="text-xs">depois R$ 79,90/mês · cancele quando quiser</div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Testimonials */}
      <motion.section {...fadeUp} className="px-4 py-16 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: GOLD }}>Quem já usou</p>
          <h2 className="text-3xl md:text-4xl font-black">+1.200 alunos transformados</h2>
        </div>
        <motion.div variants={staggerContainer} initial="initial" whileInView="whileInView" viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
          {TESTIMONIALS.map((t) => (
            <motion.div key={t.name} variants={staggerItem}
              className="p-5 rounded-2xl"
              style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex mb-3 text-sm">{'⭐'.repeat(t.rating)}</div>
              <p className="text-sm mb-3 leading-relaxed" style={{ color: '#ccc' }}>"{t.text}"</p>
              <p className="text-xs font-bold" style={{ color: GOLD }}>{t.name}</p>
              <p className="text-[11px]" style={{ color: '#555' }}>{t.city}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* FAQ */}
      <motion.section {...fadeUp} className="px-4 py-16 max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: GOLD }}>Dúvidas frequentes</p>
          <h2 className="text-3xl md:text-4xl font-black">Pergunte antes de pagar</h2>
        </div>
        <div className="space-y-3">
          {FAQ.map((item, i) => (
            <div key={i} className="rounded-2xl overflow-hidden"
              style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)' }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left">
                <span className="font-bold text-sm md:text-base">{item.q}</span>
                <ChevronDown className={`w-5 h-5 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} style={{ color: GOLD }} />
              </button>
              {openFaq === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                  className="px-5 pb-4 text-sm leading-relaxed" style={{ color: '#aaa' }}>
                  {item.a}
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </motion.section>

      {/* Trust / Garantia */}
      <motion.section {...fadeUp} className="px-4 py-12 max-w-3xl mx-auto">
        <div className="rounded-2xl p-6 md:p-8 text-center"
          style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.2)' }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
            style={{ background: 'rgba(34,197,94,0.15)' }}>
            <Shield className="w-6 h-6" style={{ color: '#22c55e' }} />
          </div>
          <h3 className="font-black text-lg mb-2">Garantia incondicional de 7 dias</h3>
          <p className="text-sm" style={{ color: '#888' }}>
            Se não for pra você, devolvemos 100% do valor sem perguntas. O risco é todo nosso.
          </p>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="px-6 py-10 border-t mt-12" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs" style={{ background: GOLD, color: '#000' }}>L</div>
            <span className="font-black text-sm">Life OS</span>
            <span className="text-xs" style={{ color: '#444' }}>· Agência Criativa</span>
          </div>
          <div className="flex items-center gap-5 text-xs" style={{ color: '#666' }}>
            <Link to="/catalogo" className="hover:text-white transition">Catálogo</Link>
            <Link to="/login" className="hover:text-white transition">Entrar</Link>
            <a href="mailto:contato@agenciacriativa.shop" className="hover:text-white transition">Contato</a>
          </div>
          <div className="text-[11px]" style={{ color: '#333' }}>
            © {new Date().getFullYear()} · Todos os direitos reservados
          </div>
        </div>
      </footer>
    </div>
  )
}
