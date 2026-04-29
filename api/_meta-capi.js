// =============================================================================
// META CONVERSION API — envia eventos server-side pra Meta
// =============================================================================
// Meta começou a perder cookies de tracking com iOS 14.5+ e safari ITP.
// CAPI envia o evento direto do nosso servidor pra Meta, contornando isso.
// Match rate sobe ~30-40% combinando pixel client + CAPI server.
//
// Configuração:
//   - VITE_META_PIXEL_ID (também usado pelo client)
//   - META_CAPI_TOKEN (token gerado em Events Manager → Settings → Conversions API)
//
// Se as env vars não existirem, função vira no-op silencioso (não quebra webhook)
// =============================================================================

import crypto from 'crypto'

const GRAPH_API_VERSION = 'v18.0'

/**
 * Hash SHA-256 (Meta exige email/phone hashados)
 */
function hash(value) {
  if (!value) return undefined
  return crypto.createHash('sha256').update(String(value).toLowerCase().trim()).digest('hex')
}

/**
 * Envia evento Purchase pro Meta CAPI.
 *
 * @param {object} params
 * @param {string} params.email      — email do comprador
 * @param {number} params.value      — valor da compra em BRL
 * @param {string} params.currency   — código (default 'BRL')
 * @param {string} params.eventId    — ID único do evento (Stripe session.id) pra dedupe com pixel
 * @param {string} params.fbp        — _fbp cookie (opcional, melhora match)
 * @param {string} params.fbc        — _fbc cookie (opcional, click ID)
 * @param {string} params.userIp     — IP do cliente (do request)
 * @param {string} params.userAgent  — user agent do cliente
 * @param {string} params.contentIds — array de slugs comprados
 */
export async function sendPurchaseEvent({ email, value, currency = 'BRL', eventId, fbp, fbc, userIp, userAgent, contentIds = [] }) {
  const PIXEL_ID = process.env.VITE_META_PIXEL_ID
  const TOKEN    = process.env.META_CAPI_TOKEN

  if (!PIXEL_ID || !TOKEN) {
    // Silencioso — config opcional
    return { ok: false, error: 'meta_capi_not_configured' }
  }

  const payload = {
    data: [{
      event_name:     'Purchase',
      event_time:     Math.floor(Date.now() / 1000),
      event_id:       eventId, // dedup com client-side pixel
      action_source:  'website',
      event_source_url: process.env.SITE_URL || 'https://www.agenciacriativa.shop',
      user_data: {
        em:               email ? [hash(email)] : undefined,
        client_ip_address: userIp,
        client_user_agent: userAgent,
        fbp,
        fbc,
      },
      custom_data: {
        currency,
        value,
        content_ids:  contentIds,
        content_type: 'product',
        num_items:    contentIds.length || 1,
      },
    }],
  }

  // Remove campos undefined (Meta reclama)
  payload.data[0].user_data = Object.fromEntries(
    Object.entries(payload.data[0].user_data).filter(([_, v]) => v !== undefined)
  )

  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${PIXEL_ID}/events?access_token=${TOKEN}`

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (!res.ok) {
      console.error('[meta-capi] erro:', data)
      return { ok: false, error: data?.error?.message || 'unknown' }
    }
    console.log('[meta-capi] Purchase enviado:', { eventId, value, fbtrace_id: data.fbtrace_id })
    return { ok: true, fbtrace_id: data.fbtrace_id }
  } catch (err) {
    console.error('[meta-capi] erro de rede:', err.message)
    return { ok: false, error: err.message }
  }
}
