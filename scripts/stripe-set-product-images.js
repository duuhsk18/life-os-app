// =============================================================================
// STRIPE: subir imagens dos produtos pro Checkout
// =============================================================================
// Uso: STRIPE_SECRET_KEY=sk_live_xxx node scripts/stripe-set-product-images.js
//
// O que faz:
// - Mapeia cada Stripe Price ID → URL pública da imagem
// - Atualiza o Product (não o Price) com a imagem
// - Stripe Checkout puxa automaticamente
//
// Imagens precisam estar publicamente acessíveis. As nossas estão em:
// https://www.agenciacriativa.shop/assets/products/[slug].png
// =============================================================================

import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY não setado. Roda assim:')
  console.error('   STRIPE_SECRET_KEY=sk_live_xxx node scripts/stripe-set-product-images.js')
  process.exit(1)
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
})

const SITE = 'https://www.agenciacriativa.shop'

// Mapeamento: slug → Price ID (espelhado em sales-data.js)
const PRICE_TO_SLUG = {
  'price_1TRNu0Fl5Mui7NRgQHCV7etc': 'receitas-low-carb',
  'price_1TRNu2Fl5Mui7NRg10yWSTRj': 'planilhas-treino',
  'price_1TRNu3Fl5Mui7NRg6w5SFF3r': 'receitas-indigenas',
  'price_1TRNu5Fl5Mui7NRgC43w62O2': 'templates-notion',
  'price_1TRNu6Fl5Mui7NRgKgCaTdPj': 'ebooks-autoajuda',
  'price_1TRNu8Fl5Mui7NRga8KDW8m5': 'planilhas-financeiras',
  'price_1TRNu9Fl5Mui7NRgXu4aRPLN': 'kit-completo',
  'price_1TRNuBFl5Mui7NRgrz7Z9pNy': 'life-os',
}

// Imagem por slug (kit-completo e life-os usam imagens compostas — ajusta se necessário)
const IMAGE_OVERRIDES = {
  'kit-completo': '/assets/products/receitas-low-carb.png', // troque por arte do kit se tiver
  'life-os':      '/assets/products/templates-notion.png',  // troque por arte do life-os se tiver
}

async function main() {
  console.log('🔍 Buscando produtos no Stripe...\n')

  for (const [priceId, slug] of Object.entries(PRICE_TO_SLUG)) {
    try {
      // 1. Pega o Price pra descobrir o Product ID
      const price = await stripe.prices.retrieve(priceId)
      const productId = price.product

      // 2. Monta URL da imagem
      const imagePath = IMAGE_OVERRIDES[slug] || `/assets/products/${slug}.png`
      const imageUrl = `${SITE}${imagePath}`

      // 3. Atualiza o Product
      const updated = await stripe.products.update(productId, {
        images: [imageUrl],
      })

      console.log(`✅ ${slug.padEnd(25)} → ${imageUrl}`)
      console.log(`   Product: ${updated.id} | imagens: ${updated.images.length}`)
    } catch (err) {
      console.error(`❌ ${slug}: ${err.message}`)
    }
  }

  console.log('\n✨ Pronto. As imagens já aparecem no Checkout do Stripe imediatamente.')
}

main().catch((err) => {
  console.error('Erro fatal:', err)
  process.exit(1)
})
