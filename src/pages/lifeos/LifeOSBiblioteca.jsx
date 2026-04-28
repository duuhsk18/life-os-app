import React, { useState } from 'react'
import LifeOSLayout from '@/components/lifeos/LifeOSLayout'
import { CATEGORIES, BIBLIOTECA, BIBLIOTECA_CONFIG } from '@/lib/biblioteca-data'
import { Download, Lock, ExternalLink, BookOpen, Search } from 'lucide-react'

const GOLD = '#F4C430'

const BADGE_COLORS = {
  Popular: { bg: 'rgba(249,115,22,0.15)', text: '#f97316', border: 'rgba(249,115,22,0.3)' },
  Novo:    { bg: 'rgba(59,130,246,0.15)',  text: '#3b82f6',  border: 'rgba(59,130,246,0.3)' },
  PRO:     { bg: 'rgba(168,85,247,0.15)',  text: '#a855f7',  border: 'rgba(168,85,247,0.3)' },
  'Bônus': { bg: 'rgba(244,196,48,0.12)',  text: GOLD,       border: 'rgba(244,196,48,0.25)' },
}

function Badge({ label }) {
  const c = BADGE_COLORS[label] || { bg: 'rgba(255,255,255,0.08)', text: '#aaa', border: 'rgba(255,255,255,0.15)' }
  return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>{label}</span>
}

function ItemCard({ item }) {
  return (
    <div className="rounded-2xl overflow-hidden flex flex-col" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="w-full aspect-video flex items-center justify-center" style={{ background: '#1a1a1a', minHeight: 110 }}>
        {item.image
          ? <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
          : <BookOpen className="w-8 h-8" style={{ color: '#333' }} />}
      </div>
      <div className="p-4 flex flex-col flex-1 gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-bold leading-snug" style={{ color: '#f0f0f0' }}>{item.title}</h3>
          {item.badge && <Badge label={item.badge} />}
        </div>
        <p className="text-xs leading-relaxed flex-1" style={{ color: '#555' }}>{item.description}</p>
        {item.download_url
          ? <a href={item.download_url} target="_blank" rel="noopener noreferrer"
              className="mt-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold hover:opacity-80 transition-all"
              style={{ background: 'rgba(244,196,48,0.12)', color: GOLD, border: '1px solid rgba(244,196,48,0.25)' }}>
              <Download className="w-3.5 h-3.5" />Baixar<ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          : <div className="mt-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold"
              style={{ background: 'rgba(255,255,255,0.04)', color: '#444', border: '1px solid rgba(255,255,255,0.06)' }}>
              <Lock className="w-3.5 h-3.5" />Em breve
            </div>}
      </div>
    </div>
  )
}

export default function LifeOSBiblioteca() {
  const [tab, setTab]       = useState(CATEGORIES[0].id)
  const [search, setSearch] = useState('')

  const category = BIBLIOTECA[tab]
  const items = (category?.items || []).filter(item => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
  })

  return (
    <LifeOSLayout>
      <div className="px-4 md:px-8 py-6 max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-black">{BIBLIOTECA_CONFIG.title}</h1>
          <p className="text-sm mt-1" style={{ color: '#555' }}>{BIBLIOTECA_CONFIG.subtitle}</p>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-6" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: '#444' }} />
          <input type="text" placeholder="Buscar materiais..." value={search} onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none" style={{ color: '#ccc' }} />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-6 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
          {CATEGORIES.map(cat => {
            const active = tab === cat.id
            return (
              <button key={cat.id} onClick={() => { setTab(cat.id); setSearch('') }}
                className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap"
                style={{ background: active ? `${cat.color}20` : '#111', color: active ? cat.color : '#555', border: active ? `1px solid ${cat.color}40` : '1px solid rgba(255,255,255,0.06)' }}>
                <span>{cat.icon}</span>{cat.label}
                <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                  style={{ background: active ? `${cat.color}30` : 'rgba(255,255,255,0.05)', color: active ? cat.color : '#444' }}>
                  {BIBLIOTECA[cat.id]?.items?.length || 0}
                </span>
              </button>
            )
          })}
        </div>

        {category?.description && !search && <p className="text-xs mb-5" style={{ color: '#555' }}>{category.description}</p>}

        {items.length === 0
          ? <div className="text-center py-16 text-sm" style={{ color: '#444' }}>Nenhum item encontrado.</div>
          : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {items.map(item => <ItemCard key={item.id} item={item} />)}
            </div>}

        <p className="text-xs text-center mt-10" style={{ color: '#2a2a2a' }}>Novos materiais são adicionados mensalmente para membros ativos.</p>
      </div>
    </LifeOSLayout>
  )
}
