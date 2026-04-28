import { useEffect } from 'react'

/**
 * PageMeta — atualiza title + meta tags da página atual.
 * Sem dependências externas. Manipula o DOM diretamente no head.
 *
 * Uso:
 *   <PageMeta
 *     title="Receitas Low Carb — Agência Criativa"
 *     description="80+ receitas testadas..."
 *     canonical="https://www.agenciacriativa.shop/p/receitas-low-carb"
 *     ogImage="https://www.agenciacriativa.shop/assets/og-receitas.png"
 *     schema={{ "@context": "...", "@type": "Product", ... }}
 *   />
 */

const SITE = 'https://www.agenciacriativa.shop'
const DEFAULT_OG = `${SITE}/assets/hero-3d.png`

function setMetaTag(attr, value, content) {
  if (!content) return
  let el = document.querySelector(`meta[${attr}="${value}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, value)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setLink(rel, href) {
  if (!href) return
  let el = document.querySelector(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

const SCHEMA_ID = 'page-jsonld-schema'

function setSchema(schema) {
  // Remove anterior
  document.getElementById(SCHEMA_ID)?.remove()
  if (!schema) return
  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.id = SCHEMA_ID
  script.text = JSON.stringify(schema)
  document.head.appendChild(script)
}

export default function PageMeta({ title, description, canonical, ogImage, ogType = 'website', schema, noindex = false }) {
  useEffect(() => {
    if (title) document.title = title
    setMetaTag('name', 'description', description)
    setMetaTag('name', 'robots', noindex ? 'noindex,follow' : 'index,follow,max-image-preview:large')

    // Open Graph
    setMetaTag('property', 'og:title', title)
    setMetaTag('property', 'og:description', description)
    setMetaTag('property', 'og:type', ogType)
    setMetaTag('property', 'og:url', canonical)
    setMetaTag('property', 'og:image', ogImage || DEFAULT_OG)
    setMetaTag('property', 'og:locale', 'pt_BR')

    // Twitter
    setMetaTag('name', 'twitter:card', 'summary_large_image')
    setMetaTag('name', 'twitter:title', title)
    setMetaTag('name', 'twitter:description', description)
    setMetaTag('name', 'twitter:image', ogImage || DEFAULT_OG)

    // Canonical
    setLink('canonical', canonical)

    // Schema.org JSON-LD por página
    setSchema(schema)

    // Cleanup do schema ao desmontar (mantém title/meta — outra página vai sobrescrever)
    return () => setSchema(null)
  }, [title, description, canonical, ogImage, ogType, schema, noindex])

  return null
}
