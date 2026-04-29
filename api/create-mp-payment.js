// =============================================================================
// CREATE MP PAYMENT — cria preferência de pagamento no Mercado Pago
// =============================================================================
// Usado pelo CheckoutPage quando cliente escolhe "Pix" como forma de pagamento.
// Cria uma Preference no Mercado Pago e retorna a URL de checkout.
// O cliente é redirecionado pra página do MP, paga via Pix, e volta pro nosso
// /obrigado. O webhook (api/mp-webhook.js) recebe a notificação e libera acesso.
//
// Body: { items: ['receitas-low-carb'], email?: 'opcional' }
// Returns: { url: 'https://www.mercadopago.com.br/checkout/v1/...' }
//
// Configura SOMENTE Pix (exclui cartão e boleto). Cartão fica via Stripe.
// =============================================================================

const MP_API = 'https://api.mercadopago.com/checkout/preferences'

// Catálogo de produtos (espelho do sales-data.js, com preços + títulos curtos)
const PRODUCT_CATALOG = {
  'receitas-low-carb':     { title: 'Receitas Low Carb',          price: 27.90 },
  'planilhas-treino':      { title: 'Planilhas de Treino',        price: 27.90 },
  'receitas-indigenas':    { title: 'Receitas Indígenas',         price: 27.90 },
  'templates-notion':      { title: '7 Ferramentas Interativas',  price: 27.90 },
  'ebooks-autoajuda':      { title: 'Coleção 5 Ebooks',           price: 27.90 },
  'planilhas-financeiras': { title: '8 Planilhas Financeiras',    price: 27.90 },
  'kit-completo':          { title: 'Kit Completo (6 produtos)',  price: 47.00 },
  'life-os':               { title: 'Life OS — 1º mês',           price: 59.90 },
}

const SITE = process.env.SITE_URL || 'https://www.agenciacriativa.shop'
const isValidEmail = (e) => typeof e === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!process.env.MP_ACCESS_TOKEN) {
    console.error('[mp-create] MP_ACCESS_TOKEN não configurado')
    return res.status(500).json({ error: 'mp_not_configured', message: 'Pix temporariamente indisponível.' })
  }

  const { items, email } = req.body || {}

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'invalid_items' })
  }

  // Filtra slugs válidos
  const validSlugs = items.filter((s) => typeof s === 'string' && PRODUCT_CATALOG[s])
  if (validSlugs.length === 0) {
    return res.status(400).json({ error: 'no_valid_items' })
  }

  // Life OS é assinatura — Pix simples não funciona pra recurring (cliente pagaria 1 vez só)
  // Bloqueia por enquanto; cliente que quer Life OS via Pix usa cartão de débito (que vira recorrência)
  if (validSlugs.includes('life-os')) {
    return res.status(400).json({
      error: 'life_os_pix_not_supported',
      message: 'Life OS é assinatura mensal — pague com cartão pra recorrência automática. Pix é só pra produtos vitalícios.',
    })
  }

  // Monta line_items pro MP
  const mpItems = validSlugs.map((slug) => ({
    id:           slug,
    title:        PRODUCT_CATALOG[slug].title,
    quantity:     1,
    unit_price:   PRODUCT_CATALOG[slug].price,
    currency_id:  'BRL',
  }))

  // External reference: vai pro webhook poder identificar o que foi comprado
  // Formato: JSON com slugs + email (se fornecido)
  const externalRef = JSON.stringify({
    slugs: validSlugs,
    email: isValidEmail(email) ? email.toLowerCase().trim() : null,
  })

  const preference = {
    items: mpItems,
    external_reference: externalRef,
    back_urls: {
      success: `${SITE}/obrigado?slugs=${encodeURIComponent(validSlugs.join(','))}&via=mp`,
      failure: `${SITE}/p/${validSlugs[0]}?mp_error=1`,
      pending: `${SITE}/obrigado?slugs=${encodeURIComponent(validSlugs.join(','))}&via=mp&pending=1`,
    },
    auto_return: 'approved',
    payment_methods: {
      // Aceita SOMENTE Pix (exclui cartão e boleto — esses ficam via Stripe)
      excluded_payment_types: [
        { id: 'credit_card' },
        { id: 'debit_card'  },
        { id: 'ticket'      }, // boleto
      ],
      installments: 1,
    },
    notification_url: `${SITE}/api/mp-webhook`,
    statement_descriptor: 'AGENCIACRIATIVA', // aparece na fatura/extrato
  }

  // Pré-preenche email se fornecido (UX)
  if (isValidEmail(email)) {
    preference.payer = { email: email.toLowerCase().trim() }
  }

  try {
    const r = await fetch(MP_API, {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify(preference),
    })

    const data = await r.json()

    if (!r.ok) {
      console.error('[mp-create] erro:', r.status, data)
      return res.status(r.status).json({
        error: data?.message || 'mp_error',
        details: data,
      })
    }

    console.log('[mp-create] preferência criada:', data.id, 'pra slugs:', validSlugs.join(','))
    return res.status(200).json({
      url: data.init_point,
      preferenceId: data.id,
    })
  } catch (err) {
    console.error('[mp-create] erro de rede:', err.message)
    return res.status(500).json({ error: err.message })
  }
}
