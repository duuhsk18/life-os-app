// =============================================================================
// CREATE MP PIX — cria pagamento Pix direto via API do Mercado Pago
// =============================================================================
// Diferente de create-mp-payment.js (que usa Checkout Pro/Preferences),
// este usa /v1/payments com payment_method_id='pix' pra gerar QR code direto.
// Isso permite que o usuário pague NA NOSSA página (sem ir pro MP).
//
// Body: { items: ['receitas-low-carb'], email: 'cliente@email.com' (obrigatório) }
// Returns: {
//   paymentId: '156199817815',
//   qrCode: '00020126580014br.gov.bcb.pix...',  // pix-copia-e-cola
//   qrCodeBase64: 'iVBORw0KGgo...',              // imagem PNG do QR
//   amount: 27.90,
//   expiresAt: '2026-04-30T15:00:00Z',
// }
// =============================================================================

import { scheduleAbandonedPixReminder } from './_email.js'

const MP_PAYMENTS_API = 'https://api.mercadopago.com/v1/payments'

const PRODUCT_CATALOG = {
  'receitas-low-carb':     { title: 'Receitas Low Carb',          price: 27.90 },
  'planilhas-treino':      { title: 'Planilhas de Treino',        price: 27.90 },
  'receitas-indigenas':    { title: 'Receitas Indígenas',         price: 27.90 },
  'templates-notion':      { title: '7 Ferramentas Interativas',  price: 27.90 },
  'ebooks-autoajuda':      { title: 'Coleção 5 Ebooks',           price: 27.90 },
  'planilhas-financeiras': { title: '8 Planilhas Financeiras',    price: 27.90 },
  'kit-completo':          { title: 'Kit Completo (6 produtos)',  price: 47.00 },
}

const isValidEmail = (e) => typeof e === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!process.env.MP_ACCESS_TOKEN) {
    return res.status(500).json({ error: 'mp_not_configured' })
  }

  const { items, email } = req.body || {}

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'invalid_items' })
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'email_required', message: 'Email é obrigatório pro Pix.' })
  }

  const validSlugs = items.filter((s) => typeof s === 'string' && PRODUCT_CATALOG[s])
  if (validSlugs.length === 0) {
    return res.status(400).json({ error: 'no_valid_items' })
  }

  // Life OS é assinatura — Pix avulso não funciona
  if (validSlugs.includes('life-os')) {
    return res.status(400).json({ error: 'life_os_pix_not_supported' })
  }

  // Calcula valor total e título
  const total = validSlugs.reduce((sum, s) => sum + PRODUCT_CATALOG[s].price, 0)
  const titles = validSlugs.map((s) => PRODUCT_CATALOG[s].title).join(', ')

  // External reference: o webhook lê pra liberar entitlements
  const externalRef = JSON.stringify({
    slugs: validSlugs,
    email: email.toLowerCase().trim(),
  })

  // Body do pagamento Pix direto
  // Docs: https://www.mercadopago.com.br/developers/pt/reference/payments/_payments/post
  const paymentBody = {
    transaction_amount: total,
    description: titles.length > 100 ? titles.slice(0, 97) + '...' : titles,
    payment_method_id: 'pix',
    payer: {
      email: email.toLowerCase().trim(),
      first_name: email.split('@')[0],
    },
    external_reference: externalRef,
    notification_url: `${process.env.SITE_URL || 'https://www.agenciacriativa.shop'}/api/mp-webhook`,
    statement_descriptor: 'AGENCIACRIATIVA',
    // Pix expira em 30 minutos por padrão. Aumentamos pra 60 minutos.
    date_of_expiration: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  }

  try {
    // Idempotency-Key evita criação duplicada se o request for reenviado
    const idempotencyKey = `${email}-${validSlugs.join(',')}-${Date.now()}`

    const r = await fetch(MP_PAYMENTS_API, {
      method:  'POST',
      headers: {
        'Authorization':  `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        'Content-Type':   'application/json',
        'X-Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(paymentBody),
    })

    const data = await r.json()

    if (!r.ok) {
      console.error('[mp-pix] erro MP:', r.status, data)
      return res.status(r.status).json({
        error:   data?.message || 'mp_pix_error',
        details: data,
      })
    }

    const td = data.point_of_interaction?.transaction_data
    if (!td?.qr_code) {
      console.error('[mp-pix] resposta sem QR:', data)
      return res.status(500).json({ error: 'no_qr_in_response' })
    }

    console.log('[mp-pix] pagamento criado:', data.id, 'pra', email, 'total R$', total)

    // Agenda email de recovery em +1h (não-bloqueante)
    scheduleAbandonedPixReminder({
      email,
      slugs: validSlugs,
      paymentId: String(data.id),
      amount: total,
      qrCode: td.qr_code,
      logPrefix: '[mp-pix]',
    }).catch((e) => console.warn('[mp-pix] erro agendando reminder:', e.message))

    return res.status(200).json({
      paymentId:    String(data.id),
      qrCode:       td.qr_code,
      qrCodeBase64: td.qr_code_base64,
      ticketUrl:    td.ticket_url,
      amount:       total,
      expiresAt:    data.date_of_expiration,
      status:       data.status,
    })
  } catch (err) {
    console.error('[mp-pix] erro de rede:', err.message)
    return res.status(500).json({ error: err.message })
  }
}
