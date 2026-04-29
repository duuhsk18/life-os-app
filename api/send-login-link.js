// =============================================================================
// SEND LOGIN LINK — fluxo de "esqueci a senha" / login por magic link
// =============================================================================
// Endpoint público. Recebe um email, valida se EXISTE conta,
// gera magic link via admin.generateLink (sem rate limit do otp endpoint)
// e envia via Resend REST API com nosso template branded.
//
// Por que admin.generateLink em vez de signInWithOtp:
//   - Não tem rate limit chato de 60s entre requests
//   - Funciona pra users existentes
//   - Sempre envia mesmo que user esteja em "rate limit window"
//
// Privacy: por segurança contra enumeração de emails, NÃO revela se o email
// existe ou não. Resposta sempre é a mesma ("se o email existir, vai chegar").
//
// Rate limit: 30s por IP (memória in-process, ok pra Hobby)
// =============================================================================

import { createClient } from '@supabase/supabase-js'
import { sendMagicLinkEmail } from './_email.js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Memória in-process pra rate-limit (ok pra Vercel Hobby — fica enquanto função "warm")
const recentByIp = new Map()
function shouldRateLimit(ip) {
  const now = Date.now()
  for (const [k, t] of recentByIp.entries()) if (now - t > 120000) recentByIp.delete(k)
  const last = recentByIp.get(ip) || 0
  if (now - last < 30000) return true
  recentByIp.set(ip, now)
  return false
}

const isValidEmail = (e) => typeof e === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e.length < 255

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email } = req.body || {}
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'invalid_email', message: 'E-mail inválido.' })
  }

  // Rate limit por IP
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.headers['x-real-ip'] || 'unknown'
  if (shouldRateLimit(ip)) {
    return res.status(429).json({ error: 'rate_limited', message: 'Aguarde alguns segundos antes de tentar de novo.' })
  }

  const cleanEmail = email.toLowerCase().trim()

  try {
    // 1. Verifica se user existe
    const { data: list, error: listErr } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
    if (listErr) {
      console.error('[send-login-link] listUsers:', listErr.message)
      // Resposta neutra mesmo em erro pra não vazar info
      return res.status(200).json({ ok: true, message: 'Se o email tiver conta, o link chegará em 1 minuto.' })
    }

    const user = list?.users?.find((u) => u.email?.toLowerCase() === cleanEmail)

    if (!user) {
      // NÃO REVELA que o email não existe (segurança contra enumeração)
      // Mas log interno pra debug
      console.log('[send-login-link] Tentativa pra email inexistente:', cleanEmail)
      // Pequeno delay artificial pra não dar pra distinguir por timing
      await new Promise((r) => setTimeout(r, 800))
      return res.status(200).json({ ok: true, message: 'Se o email tiver conta, o link chegará em 1 minuto.' })
    }

    // 2. User existe — envia magic link via Resend (caminho que sabemos que funciona)
    const name = user.user_metadata?.full_name || cleanEmail.split('@')[0] || 'Membro'
    const result = await sendMagicLinkEmail({
      supabase,
      email: cleanEmail,
      name,
      logPrefix: '[send-login-link]',
    })

    if (!result.ok) {
      console.error('[send-login-link] Falhou:', result.error)
      return res.status(500).json({ error: 'send_failed', message: 'Não foi possível enviar o link agora. Tenta de novo daqui a pouco.' })
    }

    return res.status(200).json({ ok: true, message: 'Link enviado! Cheque sua caixa de entrada.' })
  } catch (err) {
    console.error('[send-login-link] Erro:', err.message)
    return res.status(500).json({ error: 'unexpected', message: 'Erro inesperado. Tenta de novo.' })
  }
}
