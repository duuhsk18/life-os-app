// =============================================================================
// MP PAYMENT STATUS — consulta status de pagamento Pix
// =============================================================================
// Usado pelo polling do frontend pra saber se o cliente já pagou.
// GET /api/mp-payment-status?id=156199817815
// Returns: { status: 'pending' | 'approved' | 'rejected' | 'cancelled' }
//
// Status possíveis MP:
//   pending      — aguardando pagamento (Pix ainda não pago)
//   approved     — pago e aprovado ✅
//   authorized   — autorizado mas não capturado (pra cartão)
//   in_process   — sendo processado
//   rejected     — recusado
//   cancelled    — cancelado (expirou ou usuário cancelou)
//   refunded     — estornado
//   charged_back — chargeback
// =============================================================================

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!process.env.MP_ACCESS_TOKEN) {
    return res.status(500).json({ error: 'mp_not_configured' })
  }

  const paymentId = req.query?.id
  if (!paymentId) {
    return res.status(400).json({ error: 'no_payment_id' })
  }

  try {
    const r = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { 'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}` },
    })

    if (!r.ok) {
      return res.status(r.status).json({ error: 'mp_fetch_failed', status: r.status })
    }

    const data = await r.json()

    // Cache curto pra reduzir chamadas duplicadas
    res.setHeader('Cache-Control', 'public, max-age=2')

    return res.status(200).json({
      status:      data.status,
      statusDetail: data.status_detail,
      paid:        data.status === 'approved',
      amount:      data.transaction_amount,
      currency:    data.currency_id,
      paidAt:      data.date_approved,
    })
  } catch (err) {
    console.error('[mp-payment-status] erro:', err.message)
    return res.status(500).json({ error: err.message })
  }
}
