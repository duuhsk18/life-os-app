import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

// =============================================================================
// CATÁLOGO DE PRODUTOS — slug → onde fica a entrega
// =============================================================================
// Para cada produto comprável, definimos:
//   - title:       título exibido na área "Minha conta"
//   - color:       cor da capa do card (matches sales-data + entregavel theme)
//   - emoji:       ícone simples
//   - access_url:  link da página/HTML que o cliente acessa após login
//                  (HTMLs estáticos servidos por https://agenciacriativa.shop/entregaveis/...)
//   - kind:        'deliverable' (HTML estático) ou 'app' (rota interna como /membros)
// =============================================================================

export const PRODUCT_CATALOG = {
  'receitas-low-carb': {
    slug:        'receitas-low-carb',
    title:       'Receitas Low Carb',
    description: '30 receitas testadas com macros calculados.',
    emoji:       '🥗',
    color:       '#10B981',
    kind:        'deliverable',
    access_url:  '/entregaveis/receitas-low-carb/receitas-low-carb.html',
  },
  'planilhas-treino': {
    slug:        'planilhas-treino',
    title:       'Planilhas de Treino',
    description: 'Hipertrofia, emagrecimento e funcional.',
    emoji:       '💪',
    color:       '#F97316',
    kind:        'deliverable',
    access_url:  '/entregaveis/planilhas-treino/planilhas-treino.html',
  },
  'receitas-indigenas': {
    slug:        'receitas-indigenas',
    title:       'Receitas Indígenas',
    description: 'Sabores ancestrais brasileiros.',
    emoji:       '🌿',
    color:       '#D97706',
    kind:        'deliverable',
    access_url:  '/entregaveis/receitas-indigenas/receitas-indigenas.html',
  },
  'templates-notion': {
    slug:        'templates-notion',
    title:       '7 Ferramentas Interativas',
    description: 'Dashboard, projetos, hábitos e mais.',
    emoji:       '📋',
    color:       '#EC4899',
    kind:        'deliverable',
    access_url:  '/entregaveis/templates-notion/templates-notion.html',
  },
  'ebooks-autoajuda': {
    slug:        'ebooks-autoajuda',
    title:       'Coleção 5 Ebooks',
    description: 'Disciplina, foco e mentalidade.',
    emoji:       '📚',
    color:       '#8B5CF6',
    kind:        'deliverable',
    access_url:  '/entregaveis/ebooks-autoajuda/index.html',
  },
  'planilhas-financeiras': {
    slug:        'planilhas-financeiras',
    title:       '8 Planilhas Financeiras',
    description: 'Orçamento, dívidas, investimentos, FIRE.',
    emoji:       '💰',
    color:       '#6366F1',
    kind:        'deliverable',
    access_url:  '/entregaveis/planilhas-financeiras/planilhas-financeiras.html',
  },
  'life-os': {
    slug:        'life-os',
    title:       'Clube Life OS',
    description: 'Sistema gamificado: hábitos, metas, journal e biblioteca.',
    emoji:       '⚡',
    color:       '#F4C430',
    kind:        'app',
    access_url:  '/membros',
  },
}

export const ALL_PRODUCT_SLUGS = Object.keys(PRODUCT_CATALOG)

export function getProductInfo(slug) {
  return PRODUCT_CATALOG[slug] || null
}

// =============================================================================
// Hook: useUserProducts() — busca os produtos ativos do usuário logado
// =============================================================================

export function useUserProducts() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  useEffect(() => {
    if (!user) {
      setProducts([])
      setLoading(false)
      return
    }

    let cancelled = false

    async function fetchProducts() {
      setLoading(true)
      const { data, error } = await supabase
        .from('lifeos_user_products')
        .select('product_slug, granted_at, source, active')
        .eq('user_id', user.id)
        .eq('active',  true)
        .order('granted_at', { ascending: false })

      if (cancelled) return

      if (error) {
        setError(error.message)
        setProducts([])
      } else {
        const enriched = (data || [])
          .map((row) => ({
            ...row,
            ...getProductInfo(row.product_slug),
          }))
          .filter((p) => p.title) // descarta slugs órfãos do catálogo
        setProducts(enriched)
        setError(null)
      }
      setLoading(false)
    }

    fetchProducts()
    return () => { cancelled = true }
  }, [user?.id])

  const hasLifeOS = products.some((p) => p.slug === 'life-os')
  const deliverables = products.filter((p) => p.kind === 'deliverable')

  return { products, deliverables, hasLifeOS, loading, error }
}
