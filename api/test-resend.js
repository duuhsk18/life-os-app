// =============================================================================
// ENDPOINT TEMPORÁRIO: testa envio direto via Resend API REST
// =============================================================================
// Usa a mesma API key configurada no Supabase SMTP, mas via HTTP API em vez de
// SMTP. Se funcionar, Resend está OK e problema é só na config SMTP do Supabase.
//
// Auth: ?secret=${TEST_SECRET} (configurar no Vercel env)
// Uso: GET /api/test-resend?secret=...&to=email@destino.com
// =============================================================================

export default async function handler(req, res) {
  const { secret, to } = req.query

  if (!process.env.TEST_SECRET || secret !== process.env.TEST_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: 'RESEND_API_KEY não configurado em Vercel env vars' })
  }

  const recipient = to || 'duuharts01@gmail.com'

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        from:    'Agência Criativa <noreply@agenciacriativa.shop>',
        to:      [recipient],
        subject: 'Teste Resend — diagnóstico',
        html:    `
          <div style="font-family:sans-serif; padding:20px; background:#0a0a0a; color:#fff;">
            <h1 style="color:#F4C430;">Resend funcionando!</h1>
            <p>Se você está vendo isso, a API key e o domínio do Resend estão OK.</p>
            <p>Significa que o problema do email não chegando é na config SMTP do Supabase, não no Resend.</p>
            <p style="color:#888; font-size:12px;">Enviado em ${new Date().toISOString()}</p>
          </div>
        `,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return res.status(response.status).json({
        ok:     false,
        status: response.status,
        error:  data,
      })
    }

    return res.status(200).json({
      ok:        true,
      sent_to:   recipient,
      resend_id: data.id,
      message:   'Email enviado via Resend REST API. Cheque a caixa de entrada.',
    })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
