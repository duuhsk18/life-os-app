// =============================================================================
// SCRIPT ONE-OFF: revogar acesso manual quando webhook de reembolso falhou
// =============================================================================
// Faz o que o webhook faria em REVOKE_EVENTS: marca active=false no entitlement.
// Usuário continua existindo no Supabase Auth (apenas o acesso ao produto é
// removido). Não envia email — refunds geralmente já foram comunicados pelo Kiwify.
//
// Uso:
//   1. Edita ORDERS_TO_REVOKE abaixo
//   2. node --env-file=.env.production scripts/revoke-manual.js
// =============================================================================

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// ===== EDITAR AQUI =====
const ORDERS_TO_REVOKE = [
  {
    email:        'mynameisdarke@gmail.com',
    productSlugs: ['receitas-low-carb'],
    reason:       'reembolso — webhook falhou (apex 307 redirect)',
  },
]
// ========================

async function findUserByEmail(email) {
  const { data: list, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (error) {
    console.error(`  ✗ listUsers: ${error.message}`)
    return null
  }
  const user = list?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase())
  return user?.id || null
}

async function main() {
  console.log(`Revogando ${ORDERS_TO_REVOKE.length} ordem(s) manualmente...\n`)

  for (const order of ORDERS_TO_REVOKE) {
    console.log(`▶ ${order.email} → ${order.productSlugs.join(', ')}`)
    console.log(`  motivo: ${order.reason}`)

    try {
      const userId = await findUserByEmail(order.email)
      if (!userId) {
        console.error(`  ✗ Usuário não encontrado no Supabase`)
        continue
      }

      const { error, count } = await supabase
        .from('lifeos_user_products')
        .update({ active: false }, { count: 'exact' })
        .eq('user_id', userId)
        .in('product_slug', order.productSlugs)
        .eq('active', true)

      if (error) {
        console.error(`  ✗ Erro update: ${error.message}`)
        continue
      }

      if (count === 0) {
        console.log(`  ⚠ Nenhuma linha afetada — entitlement já estava inativo ou nunca existiu`)
      } else {
        console.log(`  ✓ ${count} entitlement(s) revogado(s) (active=false)`)
      }
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
