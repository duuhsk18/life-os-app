// Diagnóstico do estado de auth do usuário no Supabase
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const supabasePublic = createClient(
  process.env.SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

const TARGET_EMAIL = process.argv[2] || 'magonfotografia@gmail.com'

async function main() {
  console.log(`Diagnóstico: ${TARGET_EMAIL}\n`)

  // 1. Lista usuários com esse email
  const { data: list, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (error) {
    console.error('Erro listando users:', error.message)
    return
  }

  const user = list?.users?.find((u) => u.email?.toLowerCase() === TARGET_EMAIL.toLowerCase())

  if (!user) {
    console.log('  ✗ Usuário NÃO existe no Supabase')
    return
  }

  console.log('Estado do usuário:')
  console.log(`  id:                 ${user.id}`)
  console.log(`  email:              ${user.email}`)
  console.log(`  created_at:         ${user.created_at}`)
  console.log(`  email_confirmed_at: ${user.email_confirmed_at || '(não confirmado)'}`)
  console.log(`  invited_at:         ${user.invited_at || '(nunca convidado)'}`)
  console.log(`  last_sign_in_at:    ${user.last_sign_in_at || '(nunca logou)'}`)
  console.log(`  confirmation_sent_at: ${user.confirmation_sent_at || '(nenhum)'}`)
  console.log(`  recovery_sent_at:   ${user.recovery_sent_at || '(nenhum)'}`)
  console.log(`  user_metadata:      ${JSON.stringify(user.user_metadata)}`)
  console.log(`  app_metadata:       ${JSON.stringify(user.app_metadata)}`)
  console.log()

  // 2. Verifica entitlements
  const { data: products, error: pErr } = await supabase
    .from('lifeos_user_products')
    .select('*')
    .eq('user_id', user.id)

  if (pErr) {
    console.error('Erro buscando entitlements:', pErr.message)
  } else {
    console.log(`Entitlements (${products?.length || 0}):`)
    products?.forEach((p) => {
      console.log(`  - ${p.product_slug} (active=${p.active}, source=${p.source})`)
    })
  }
  console.log()

  // 3. Testa gerar magic link via API direta (bypass invite)
  console.log('Tentando gerar magic link diretamente (admin.generateLink)...')
  const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
    type:  'magiclink',
    email: TARGET_EMAIL,
    options: {
      redirectTo: `${process.env.SITE_URL}/minha-conta`,
    },
  })

  if (linkErr) {
    console.error('  ✗ Erro:', linkErr.message)
  } else {
    console.log('  ✓ Magic link gerado:')
    console.log(`    action_link: ${linkData?.properties?.action_link}`)
    console.log(`    hashed_token: ${linkData?.properties?.hashed_token?.slice(0, 20)}...`)
    console.log(`    email_otp: ${linkData?.properties?.email_otp}`)
    console.log()
    console.log('  ⚠ NOTA: generateLink retorna o link, mas NÃO envia email.')
  }
  console.log()

  // 4. DISPARA email de verdade via signInWithOtp (passa pela SMTP do Supabase → Resend)
  console.log('Disparando email via signInWithOtp (passa pela SMTP configurada)...')
  const { error: otpErr } = await supabasePublic.auth.signInWithOtp({
    email: TARGET_EMAIL,
    options: {
      shouldCreateUser: false,
      emailRedirectTo:  `${process.env.SITE_URL}/minha-conta`,
    },
  })

  if (otpErr) {
    console.error(`  ✗ Erro: ${otpErr.message}`)
    if (otpErr.message?.toLowerCase().includes('rate')) {
      console.error('  ⚠ Rate limit — aguarde 60s entre tentativas pro mesmo email')
    }
  } else {
    console.log(`  ✓ Email disparado pra ${TARGET_EMAIL}`)
    console.log('  → Cheque a caixa de entrada (Promoções/Spam também). Pode levar 1-2 min.')
  }
}

main().catch((err) => {
  console.error('Erro fatal:', err)
  process.exit(1)
})
