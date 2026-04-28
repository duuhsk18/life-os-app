// =============================================================================
// SCRIPT ONE-OFF: liberar acesso manual quando webhook falhou
// =============================================================================
// Executa o mesmo fluxo do webhook (criar user + grant entitlement + magic link)
// Uso: node scripts/grant-manual.js
// =============================================================================

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// ===== EDITAR AQUI =====
const ORDERS_TO_GRANT = [
  {
    email:        'magonfotografia@gmail.com',
    name:         'Eduardo magon',
    productSlugs: ['planilhas-financeiras'],
    orderId:      '270f7f5b-4b4f-4216-af7e-54edc06c582d',
  },
]
// ========================

async function ensureUser({ email, name }) {
  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { full_name: name },
  })

  if (created?.user?.id) {
    console.log(`  ✓ Usuário criado: ${email}`)
    return created.user.id
  }

  if (createError?.message?.toLowerCase().includes('already')) {
    const { data: list } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
    const user = list?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase())
    if (user) {
      console.log(`  ✓ Usuário já existia: ${email}`)
      return user.id
    }
  }

  if (createError) throw createError
  return null
}

async function sendMagicLink({ email, name }) {
  const { error } = await supabase.auth.admin.inviteUserByEmail(email, {
    data:       { full_name: name },
    redirectTo: `${process.env.SITE_URL}/minha-conta`,
  })
  if (error && !error.message?.toLowerCase().includes('already')) {
    console.warn(`  ⚠ inviteUserByEmail: ${error.message}`)
  } else {
    console.log(`  ✓ Magic link enviado pra ${email}`)
  }
}

async function main() {
  console.log(`Liberando ${ORDERS_TO_GRANT.length} ordem(s) manualmente...\n`)

  for (const order of ORDERS_TO_GRANT) {
    console.log(`▶ ${order.email} → ${order.productSlugs.join(', ')}`)

    try {
      const userId = await ensureUser({ email: order.email, name: order.name })
      if (!userId) {
        console.error(`  ✗ Não conseguiu criar/encontrar usuário`)
        continue
      }

      const rows = order.productSlugs.map((slug) => ({
        user_id:         userId,
        product_slug:    slug,
        source:          'manual-provisioning',
        kiwify_order_id: order.orderId,
        active:          true,
      }))

      const { error: insErr } = await supabase
        .from('lifeos_user_products')
        .upsert(rows, { onConflict: 'user_id,product_slug', ignoreDuplicates: false })

      if (insErr) {
        console.error(`  ✗ Erro upsert: ${insErr.message}`)
        continue
      }

      console.log(`  ✓ Entitlement(s) concedido(s): ${order.productSlugs.join(', ')}`)

      await sendMagicLink({ email: order.email, name: order.name })
      console.log()
    } catch (err) {
      console.error(`  ✗ Erro:`, err.message)
    }
  }

  console.log('Concluído.')
}

main().catch((err) => {
  console.error('Erro fatal:', err)
  process.exit(1)
})
