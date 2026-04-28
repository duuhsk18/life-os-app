import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { getProductBySlug } from '@/lib/products-data'
import { CheckCircle, Star, ChevronDown, ArrowRight } from 'lucide-react'

const GOLD = '#F4C430'

function StarRating({ n }) {
  return <div className="flex gap-0.5">{Array.from({ length: n }).map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />)}</div>
}

export default function ProductPage() {
  const { slug } = useParams()
  const p = getProductBySlug(slug)
  if (!p) return <div className="min-h-screen flex items-center justify-center" style={{ background: '#000', color: '#666' }}>Página não encontrada.</div>

  const fmt = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div className="min-h-screen" style={{ background: '#000', color: '#fff' }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black" style={{ background: GOLD, color: '#000' }}>L</div>
          <span className="font-black">Life OS</span>
        </Link>
      </nav>

      {/* Hero */}
      <section className="px-6 py-16 max-w-4xl mx-auto text-center">
        <h1 className="text-3xl md:text-5xl font-black leading-tight mb-4">{p.headline}</h1>
        <p className="text-lg mb-8" style={{ color: '#666' }}>{p.subheadline}</p>
        <ul className="inline-flex flex-col items-start gap-2 mb-8">
          {p.short_list.map(item => (
            <li key={item} className="flex items-center gap-2 text-sm" style={{ color: '#ccc' }}>
              <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#22c55e' }} /> {item}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="inline-block p-6 rounded-3xl mb-4" style={{ background: '#0f0f0f', border: '2px solid rgba(244,196,48,0.3)' }}>
          <div className="flex items-end justify-center gap-2 mb-2">
            <span className="text-sm line-through" style={{ color: '#444' }}>{fmt(p.old_price)}</span>
            <span className="text-4xl font-black" style={{ color: GOLD }}>{fmt(p.current_price)}</span>
            {p.is_subscription && <span className="text-sm mb-1" style={{ color: '#555' }}>/{p.billing_period}</span>}
          </div>
          <p className="text-xs mb-4" style={{ color: '#555' }}>Cancele quando quiser · 7 dias de garantia</p>
          <a href={p.checkout_url} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-10 py-4 rounded-2xl font-black text-lg"
            style={{ background: GOLD, color: '#000' }}>
            Assinar agora <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>

      {/* Problem */}
      <section className="px-6 py-12 max-w-2xl mx-auto">
        <h2 className="text-2xl font-black mb-6">{p.problem_title}</h2>
        <ul className="space-y-3">
          {p.problem_points.map(point => (
            <li key={point} className="flex items-start gap-3 text-sm" style={{ color: '#888' }}>
              <span className="mt-0.5 flex-shrink-0" style={{ color: '#ef4444' }}>✕</span> {point}
            </li>
          ))}
        </ul>
      </section>

      {/* Solution */}
      <section className="px-6 py-12 max-w-2xl mx-auto">
        <h2 className="text-2xl font-black mb-4">{p.solution_title}</h2>
        <p style={{ color: '#888' }}>{p.solution_text}</p>
      </section>

      {/* Benefits */}
      <section className="px-6 py-12 max-w-4xl mx-auto">
        <h2 className="text-2xl font-black text-center mb-8">O que você recebe</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {p.benefits.map(b => (
            <div key={b.title} className="p-5 rounded-2xl" style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(244,196,48,0.1)' }}>
                <CheckCircle className="w-4 h-4" style={{ color: GOLD }} />
              </div>
              <h3 className="font-bold mb-1 text-sm">{b.title}</h3>
              <p className="text-xs" style={{ color: '#555' }}>{b.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bonuses */}
      <section className="px-6 py-12 max-w-3xl mx-auto">
        <h2 className="text-2xl font-black text-center mb-2">Bônus inclusos</h2>
        <p className="text-center text-sm mb-8" style={{ color: '#555' }}>Tudo isso está incluído na assinatura</p>
        <div className="space-y-3">
          {p.bonuses.map(b => (
            <div key={b.title} className="flex items-center gap-4 p-4 rounded-2xl" style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex-1">
                <div className="font-bold text-sm">{b.title}</div>
                <p className="text-xs mt-0.5" style={{ color: '#555' }}>{b.description}</p>
              </div>
              <div className="text-sm font-black flex-shrink-0 line-through" style={{ color: '#333' }}>{b.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 py-12 max-w-4xl mx-auto">
        <h2 className="text-2xl font-black text-center mb-8">O que os membros dizem</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {p.testimonials.map(t => (
            <div key={t.name} className="p-5 rounded-2xl" style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)' }}>
              <StarRating n={t.rating} />
              <p className="text-sm mt-3 mb-3" style={{ color: '#aaa' }}>"{t.text}"</p>
              <p className="text-xs font-bold" style={{ color: '#555' }}>— {t.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-12 max-w-2xl mx-auto">
        <h2 className="text-2xl font-black text-center mb-8">Dúvidas frequentes</h2>
        <div className="space-y-3">
          {p.faq.map(f => (
            <details key={f.question} className="group rounded-2xl overflow-hidden" style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)' }}>
              <summary className="flex items-center justify-between px-5 py-4 cursor-pointer text-sm font-semibold list-none">
                {f.question}
                <ChevronDown className="w-4 h-4 flex-shrink-0 group-open:rotate-180 transition-transform" style={{ color: '#555' }} />
              </summary>
              <p className="px-5 pb-4 text-sm" style={{ color: '#666' }}>{f.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-16 text-center">
        <h2 className="text-3xl font-black mb-4">Pronto para transformar sua rotina?</h2>
        <a href={p.checkout_url} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl font-black text-lg"
          style={{ background: GOLD, color: '#000' }}>
          Começar agora por {(p.current_price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/mês
          <ArrowRight className="w-5 h-5" />
        </a>
        <p className="mt-3 text-xs" style={{ color: '#444' }}>7 dias de garantia · Cancele quando quiser</p>
      </section>

      <footer className="text-center py-8 border-t text-xs" style={{ borderColor: 'rgba(255,255,255,0.06)', color: '#333' }}>
        © {new Date().getFullYear()} Life OS · Criativa Agência
      </footer>
    </div>
  )
}
