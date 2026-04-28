// =============================================================================
// CAPTURE LEAD — recebe email do popup do lead magnet, manda ebook via Resend
// =============================================================================
// Não autentica (é endpoint público, abre pra qualquer um). Validações:
//   - Email com formato razoável
//   - Honeypot pra evitar bots óbvios
//   - Rate-limit leve por IP via memória (ok pra Hobby; sobe pra Redis se virar gargalo)
//
// Não armazena em banco por enquanto. Resend tem audiences pra isso.
// Se quiser persistir, criar tabela lifeos_leads no Supabase depois.
// =============================================================================

const RESEND_API = 'https://api.resend.com/emails'
const SITE = 'https://www.agenciacriativa.shop'

// Memória in-process pra rate-limit. Fica entre invocations enquanto a função
// estiver "warm" (alguns minutos no Vercel Hobby). Suficiente pra spam casual.
const recentByIp = new Map()
function shouldRateLimit(ip) {
  const now = Date.now()
  // Limpa entries velhas
  for (const [k, t] of recentByIp.entries()) if (now - t > 60000) recentByIp.delete(k)
  const last = recentByIp.get(ip) || 0
  if (now - last < 30000) return true // 30s entre requests do mesmo IP
  recentByIp.set(ip, now)
  return false
}

const isValidEmail = (e) => typeof e === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e.length < 255

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: 'Service not configured' })
  }

  const { email, name, hp } = req.body || {}

  // Honeypot: se preenchido, bot
  if (hp) return res.status(200).json({ ok: true })

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'invalid_email', message: 'E-mail inválido.' })
  }

  // Rate-limit
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.headers['x-real-ip'] || 'unknown'
  if (shouldRateLimit(ip)) {
    return res.status(429).json({ error: 'rate_limited', message: 'Aguarde uns segundos antes de tentar de novo.' })
  }

  const cleanName = (typeof name === 'string' ? name.trim().slice(0, 80) : '') || 'leitor'
  const cleanEmail = email.toLowerCase().trim()

  // Manda email com link pro ebook gratuito
  try {
    const r = await fetch(RESEND_API, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        from:    'Agência Criativa <noreply@agenciacriativa.shop>',
        to:      [cleanEmail],
        subject: 'Seu guia: 5 Hábitos que Mudam Tudo',
        html:    renderEmail(cleanName, cleanEmail),
      }),
    })

    if (!r.ok) {
      const err = await r.text().catch(() => '')
      console.error('[capture-lead] Resend falhou:', r.status, err)
      return res.status(500).json({ error: 'send_failed' })
    }

    const data = await r.json()
    console.log('[capture-lead] enviado pra', cleanEmail, '(id=' + data.id + ')')
    return res.status(200).json({ ok: true, message: 'Guia enviado pra sua caixa de entrada.' })
  } catch (err) {
    console.error('[capture-lead] erro:', err.message)
    return res.status(500).json({ error: 'unexpected' })
  }
}

function renderEmail(name, email) {
  return `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0a0a0a;padding:40px 20px">
<tr><td align="center">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#111;border-radius:16px;border:1px solid #1f1f1f;overflow:hidden">
    <tr><td align="center" style="padding:40px 40px 24px;background:linear-gradient(135deg,#F4C430 0%,#d4a017 100%)">
      <div style="font-size:28px;font-weight:900;color:#000;letter-spacing:-0.5px;line-height:1">5 Hábitos</div>
      <div style="font-size:12px;color:#000;opacity:0.7;margin-top:6px;text-transform:uppercase;letter-spacing:2px">que Mudam Tudo</div>
    </td></tr>
    <tr><td style="padding:40px 40px 24px">
      <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#fff;line-height:1.3">Aqui está, ${name}.</h1>
      <p style="margin:0 0 16px;font-size:16px;color:#d4d4d4;line-height:1.6">O guia gratuito que você pediu. Sem fluff, só método. Lê em 8 minutos, aplica em 35 dias.</p>
      <p style="margin:0;font-size:16px;color:#d4d4d4;line-height:1.6">Implementa um por semana, na ordem. Não pula. Em 35 dias você não é mais a mesma pessoa.</p>
    </td></tr>
    <tr><td align="center" style="padding:8px 40px 32px">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
      <tr><td align="center" style="border-radius:12px;background:#F4C430">
        <a href="${SITE}/entregaveis-gratuitos/5-habitos.html"
          style="display:inline-block;padding:16px 40px;font-size:16px;font-weight:700;color:#000;text-decoration:none;border-radius:12px;letter-spacing:0.3px">
          Acessar o guia
        </a>
      </td></tr>
      </table>
    </td></tr>
    <tr><td style="padding:0 40px"><div style="height:1px;background:#222;width:100%"></div></td></tr>
    <tr><td style="padding:24px 40px 32px">
      <p style="margin:0 0 12px;font-size:14px;color:#a3a3a3;line-height:1.6"><strong style="color:#fff">P.S.</strong> Esses 5 hábitos viram um app gamificado dentro do <strong style="color:#F4C430">Life OS</strong>. Tracker com XP e streak, mais 6 produtos digitais inclusos. Se essa abordagem fizer sentido, dá uma olhada: <a href="${SITE}" style="color:#F4C430">agenciacriativa.shop</a></p>
    </td></tr>
    <tr><td align="center" style="padding:24px 40px;background:#0a0a0a;border-top:1px solid #1f1f1f">
      <p style="margin:0 0 8px;font-size:13px;color:#888">Recebeu por engano? Pode ignorar — não vamos te incomodar.</p>
      <p style="margin:0;font-size:12px;color:#555">© Agência Criativa · agenciacriativa.shop</p>
    </td></tr>
  </table>
</td></tr></table>
</body></html>`
}
