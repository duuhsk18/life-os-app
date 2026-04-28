import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Kiwify envia o token como ?signature= na query string
  const signature = req.query.signature
  if (!signature || signature !== process.env.KIWIFY_SECRET) {
    console.warn('[kiwify] Assinatura inválida recebida:', signature)
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const body = req.body
  const status = body?.order_status

  console.log('[kiwify] Evento recebido:', status, '| E-mail:', body?.customer?.email)

  // Eventos que liberam acesso
  const GRANT_EVENTS = ['paid', 'approved', 'active']
  // Eventos que revogam acesso
  const REVOKE_EVENTS = ['refunded', 'chargedback', 'cancelled']

  const email = body?.customer?.email?.toLowerCase().trim()
  const name  = body?.customer?.name || 'Membro'

  if (!email) {
    return res.status(400).json({ error: 'E-mail não encontrado no payload' })
  }

  // Eventos de pagamento aprovado / assinatura renovada
  if (GRANT_EVENTS.includes(status)) {
    try {
      // Cria o usuário — se já existir, o erro é tratado abaixo
      const { error: createError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { full_name: name },
      })

      if (createError && !createError.message?.toLowerCase().includes('already')) {
        throw createError
      }

      // Envia e-mail de acesso (magic link / convite)
      // Para novo usuário: convite com link para definir senha
      // Para usuário existente: magic link para entrar direto
      const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
        data: { full_name: name },
        redirectTo: `${process.env.SITE_URL}/membros`,
      })

      if (inviteError && !inviteError.message?.toLowerCase().includes('already')) {
        console.warn('[kiwify] Aviso convite:', inviteError.message)
      }

      console.log('[kiwify] ✅ Acesso liberado para:', email)
      return res.status(200).json({ ok: true, action: 'access_granted', email })

    } catch (err) {
      console.error('[kiwify] ❌ Erro ao criar usuário:', err.message)
      return res.status(500).json({ error: err.message })
    }
  }

  // Eventos de reembolso / cancelamento (opcional: desativa o usuário)
  if (REVOKE_EVENTS.includes(status)) {
    try {
      // Busca o usuário e desativa (ban)
      const { data: list } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
      const user = list?.users?.find(u => u.email === email)

      if (user) {
        await supabase.auth.admin.updateUserById(user.id, { ban_duration: '87600h' }) // 10 anos
        console.log('[kiwify] ⛔ Acesso revogado para:', email)
      }

      return res.status(200).json({ ok: true, action: 'access_revoked', email })
    } catch (err) {
      console.error('[kiwify] Erro ao revogar:', err.message)
      return res.status(500).json({ error: err.message })
    }
  }

  // Outros eventos (boleto gerado, carrinho abandonado etc.) — ignora
  return res.status(200).json({ ok: true, action: 'ignored', status })
}
