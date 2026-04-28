import React from 'react'
import { Link } from 'react-router-dom'
import { CheckSquare, Dumbbell, BookOpen, DollarSign, Zap, Library, Star, ArrowRight } from 'lucide-react'

const GOLD = '#F4C430'

const FEATURES = [
  { icon: CheckSquare, label: 'Hábitos com XP',     desc: 'Ganhe pontos e suba de nível conforme mantém seus hábitos.',      color: '#10b981' },
  { icon: Dumbbell,    label: 'Controle de Treinos', desc: 'Registre suas sessões e acompanhe a evolução física.',            color: '#3b82f6' },
  { icon: Zap,         label: 'Estado Flow',         desc: 'Timer Pomodoro para sessões de foco e produtividade.',            color: GOLD },
  { icon: BookOpen,    label: 'Journal Diário',       desc: 'Reflexão, gratidão e planejamento em um só lugar.',              color: '#a855f7' },
  { icon: DollarSign,  label: 'Finanças',            desc: 'Controle de receitas, gastos e metas financeiras.',              color: '#22c55e' },
  { icon: Library,     label: 'Biblioteca',          desc: '+120 planilhas, receitas, templates e ebooks inclusos.',          color: '#f59e0b' },
]

const TESTIMONIALS = [
  { name: 'Juliana M.', text: 'Em 60 dias perdi 7 kg e tenho controle dos meus gastos. Tudo em um app só!', rating: 5 },
  { name: 'Rafaela S.', text: 'O sistema de XP me vicia. Nunca mantive hábitos por tanto tempo.', rating: 5 },
  { name: 'Camila P.',  text: 'Melhor R$27 que já gastei. Uso todos os dias!', rating: 5 },
]

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: '#000', color: '#fff' }}>

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black" style={{ background: GOLD, color: '#000' }}>L</div>
          <span className="font-black">Life OS</span>
        </div>
        <Link to="/login" className="px-4 py-2 rounded-xl text-sm font-bold"
          style={{ background: 'rgba(244,196,48,0.1)', color: GOLD, border: '1px solid rgba(244,196,48,0.2)' }}>
          Entrar
        </Link>
      </nav>

      {/* Hero */}
      <section className="text-center px-6 py-20 max-w-3xl mx-auto">
        <div className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-6"
          style={{ background: 'rgba(244,196,48,0.1)', color: GOLD, border: '1px solid rgba(244,196,48,0.2)' }}>
          🔥 R$27,90/mês · Cancele quando quiser
        </div>
        <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">
          O sistema que vai<br />
          <span style={{ color: GOLD }}>transformar sua rotina</span>
        </h1>
        <p className="text-lg mb-8" style={{ color: '#666' }}>
          Hábitos, treinos, finanças, foco e uma biblioteca completa de materiais — por menos de R$1 por dia.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a href="/produto/clube-life-os"
            className="flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-lg"
            style={{ background: GOLD, color: '#000' }}>
            Começar agora <ArrowRight className="w-5 h-5" />
          </a>
          <Link to="/login" className="px-8 py-4 rounded-2xl font-bold text-sm"
            style={{ background: 'rgba(255,255,255,0.05)', color: '#ccc', border: '1px solid rgba(255,255,255,0.08)' }}>
            Já sou membro
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <h2 className="text-2xl font-black text-center mb-10">Tudo que você precisa em um lugar</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(f => (
            <div key={f.label} className="p-5 rounded-2xl" style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `${f.color}18` }}>
                <f.icon className="w-5 h-5" style={{ color: f.color }} />
              </div>
              <h3 className="font-bold mb-1">{f.label}</h3>
              <p className="text-sm" style={{ color: '#555' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-16">
        <div className="max-w-sm mx-auto p-8 rounded-3xl text-center" style={{ background: '#0f0f0f', border: '2px solid rgba(244,196,48,0.3)' }}>
          <div className="text-xs font-bold mb-2 uppercase tracking-widest" style={{ color: GOLD }}>Clube Life OS</div>
          <div className="flex items-end justify-center gap-1 mb-1">
            <span className="text-4xl font-black" style={{ color: GOLD }}>R$27,90</span>
            <span className="text-sm mb-2" style={{ color: '#555' }}>/mês</span>
          </div>
          <p className="text-sm mb-6" style={{ color: '#555' }}>Cancele quando quiser · 7 dias de garantia</p>
          <ul className="text-left space-y-2 mb-8">
            {['Área de membros Life OS completa','Gamificação com XP e níveis','Biblioteca com +120 materiais','Novos conteúdos todo mês','Acesso imediato'].map(item => (
              <li key={item} className="flex items-center gap-2 text-sm" style={{ color: '#ccc' }}>
                <span style={{ color: '#22c55e' }}>✓</span> {item}
              </li>
            ))}
          </ul>
          <a href="/produto/clube-life-os"
            className="block w-full py-4 rounded-2xl font-black" style={{ background: GOLD, color: '#000' }}>
            Assinar agora
          </a>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <h2 className="text-2xl font-black text-center mb-10">O que os membros dizem</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="p-5 rounded-2xl" style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex mb-3">{'⭐'.repeat(t.rating)}</div>
              <p className="text-sm mb-3" style={{ color: '#aaa' }}>"{t.text}"</p>
              <p className="text-xs font-bold" style={{ color: '#555' }}>— {t.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 border-t text-xs" style={{ borderColor: 'rgba(255,255,255,0.06)', color: '#333' }}>
        © {new Date().getFullYear()} Life OS · Criativa Agência
      </footer>
    </div>
  )
}
