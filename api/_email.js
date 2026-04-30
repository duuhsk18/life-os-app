// =============================================================================
// EMAIL SENDER — Resend REST API direto
// =============================================================================
// Bypassa o SMTP do Supabase (que tem bugs com Resend) e manda email
// usando a API REST do Resend. Mais robusto, controlamos template e logs.
//
// Fluxo:
//   1. Caller chama sendMagicLinkEmail({ email, name, actionLink })
//   2. Renderiza HTML branded com o action_link injetado
//   3. POST pra https://api.resend.com/emails com Bearer token
//
// O actionLink vem do Supabase admin.generateLink() — quem chama essa função
// é responsável por gerar o link primeiro.
// =============================================================================

const RESEND_API_URL = 'https://api.resend.com/emails'

/**
 * Renderiza o HTML do email em PT-BR, injetando o magic link.
 */
function renderMagicLinkHtml(actionLink) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Seu acesso ao Life OS</title>
</head>
<body style="margin:0; padding:0; background:#0a0a0a; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0a0a0a; padding:40px 20px;">
    <tr>
      <td align="center">

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px; background:#111111; border-radius:16px; border:1px solid #1f1f1f; overflow:hidden;">

          <tr>
            <td align="center" style="padding:40px 40px 24px 40px; background:linear-gradient(135deg, #F4C430 0%, #d4a017 100%);">
              <div style="font-size:28px; font-weight:900; color:#000; letter-spacing:-0.5px; line-height:1;">Life OS</div>
              <div style="font-size:12px; color:#000; opacity:0.7; margin-top:6px; text-transform:uppercase; letter-spacing:2px;">Agência Criativa</div>
            </td>
          </tr>

          <tr>
            <td style="padding:40px 40px 24px 40px;">
              <h1 style="margin:0 0 16px 0; font-size:24px; font-weight:700; color:#ffffff; line-height:1.3;">Seu acesso está pronto</h1>
              <p style="margin:0 0 8px 0; font-size:16px; color:#d4d4d4; line-height:1.6;">Sua compra foi confirmada e seu material já está liberado.</p>
              <p style="margin:0; font-size:16px; color:#d4d4d4; line-height:1.6;">Clique no botão abaixo pra fazer login e acessar tudo que você comprou:</p>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:8px 40px 32px 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="border-radius:12px; background:#F4C430;">
                    <a href="${actionLink}" style="display:inline-block; padding:16px 40px; font-size:16px; font-weight:700; color:#000000; text-decoration:none; border-radius:12px; letter-spacing:0.3px;">Acessar minha área</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:0 40px 32px 40px;">
              <p style="margin:0 0 8px 0; font-size:13px; color:#888888; line-height:1.5;">Se o botão não funcionar, copie e cole este link no navegador:</p>
              <p style="margin:0; font-size:12px; color:#F4C430; line-height:1.5; word-break:break-all;">
                <a href="${actionLink}" style="color:#F4C430; text-decoration:none;">${actionLink}</a>
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:0 40px;"><div style="height:1px; background:#222222; width:100%;"></div></td>
          </tr>

          <tr>
            <td style="padding:24px 40px 32px 40px;">
              <p style="margin:0 0 12px 0; font-size:14px; color:#a3a3a3; line-height:1.6;"><strong style="color:#ffffff;">Como funciona:</strong></p>
              <ul style="margin:0; padding:0 0 0 20px; font-size:14px; color:#a3a3a3; line-height:1.8;">
                <li>Esse link te loga automaticamente — não precisa de senha</li>
                <li>Vale por 1 hora a partir do envio</li>
                <li>Seus produtos ficam salvos na sua conta pra sempre</li>
              </ul>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:24px 40px; background:#0a0a0a; border-top:1px solid #1f1f1f;">
              <p style="margin:0 0 8px 0; font-size:13px; color:#888888;">Precisa de ajuda? Responda esse email.</p>
              <p style="margin:0; font-size:12px; color:#555555;">© Agência Criativa · agenciacriativa.shop</p>
            </td>
          </tr>

        </table>

        <p style="margin:24px 0 0 0; font-size:11px; color:#555555; text-align:center;">Você está recebendo esse email porque comprou um produto na Agência Criativa.</p>

      </td>
    </tr>
  </table>

</body>
</html>`
}

/**
 * Gera magic link via Supabase admin + envia email via Resend REST API.
 *
 * @param {object}  params
 * @param {object}  params.supabase     - Supabase client com service_role key
 * @param {string}  params.email        - destinatário
 * @param {string}  params.name         - nome do destinatário (não usado ainda no template, mas reservado)
 * @param {string}  [params.logPrefix]  - prefixo dos logs (ex: '[kiwify]')
 * @returns {Promise<{ ok: boolean, resendId?: string, error?: string }>}
 */
export async function sendMagicLinkEmail({ supabase, email, name, logPrefix = '[email]' }) {
  if (!process.env.RESEND_API_KEY) {
    console.warn(`${logPrefix} RESEND_API_KEY não configurado — pulando envio`)
    return { ok: false, error: 'RESEND_API_KEY missing' }
  }

  // 1. Gera magic link via Supabase admin (não envia email, só retorna URL)
  const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
    type:  'magiclink',
    email,
    options: {
      redirectTo: `${process.env.SITE_URL}/minha-conta`,
    },
  })

  if (linkErr) {
    console.error(`${logPrefix} generateLink falhou:`, linkErr.message)
    return { ok: false, error: linkErr.message }
  }

  const actionLink = linkData?.properties?.action_link
  if (!actionLink) {
    console.error(`${logPrefix} generateLink não retornou action_link`)
    return { ok: false, error: 'no action_link' }
  }

  // 2. Envia email via Resend REST API
  try {
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        from:    'Agência Criativa <noreply@agenciacriativa.shop>',
        to:      [email],
        subject: 'Seu acesso ao Life OS',
        html:    renderMagicLinkHtml(actionLink),
      }),
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      const errMsg = data?.message || `HTTP ${response.status}`
      console.error(`${logPrefix} Resend API falhou:`, errMsg, JSON.stringify(data))
      return { ok: false, error: errMsg }
    }

    console.log(`${logPrefix} Magic link enviado pra ${email} (resend_id=${data?.id})`)
    return { ok: true, resendId: data?.id }
  } catch (err) {
    console.error(`${logPrefix} Erro de rede chamando Resend:`, err.message)
    return { ok: false, error: err.message }
  }
}

// =============================================================================
// EMAIL SEQUENCE PÓS-COMPRA — D+3, D+7, D+30
// =============================================================================
// Agendamos 3 emails no momento da compra usando Resend scheduled_at:
// - D+3: "Como aproveitar ao máximo" + dica específica do produto
// - D+7: "Já testou X?" — engajamento + cross-sell sutil
// - D+30: oferta de upgrade (Kit ou Life OS) com cupom

const SITE = process.env.SITE_URL || 'https://www.agenciacriativa.shop'

// Mapeamento de slug → conteúdo da sequence (dica + onde acessar)
const PRODUCT_TIPS = {
  'receitas-low-carb': {
    title: 'Receitas Low Carb',
    deliverable: '/entregaveis/receitas-low-carb/receitas-low-carb.html',
    tipD3: 'Comece pelo Cardápio de 7 dias na aba "Planejamento" — só seguir e tua semana toda tá resolvida.',
    tipD7: 'Já marcou um cardápio na aba Planejamento? A Lista de Compras é gerada automaticamente — testa.',
  },
  'planilhas-treino': {
    title: 'Planilhas de Treino',
    deliverable: '/entregaveis/planilhas-treino/planilhas-treino.html',
    tipD3: 'Anota teus pesos hoje na aba Treino do Dia — em 4 semanas você vai ver gráficos da tua evolução.',
    tipD7: 'Vai na aba Evolução — você já tem dados pra ver progressão. E mede cintura/braço pra rastrear visualmente.',
  },
  'receitas-indigenas': {
    title: 'Receitas Indígenas',
    deliverable: '/entregaveis/receitas-indigenas/receitas-indigenas.html',
    tipD3: 'Começa pela Mandioca: 8 transformações de um único ingrediente. Tá na aba Cultura & Guia.',
    tipD7: 'A aba Plantas Medicinais tem 35 plantas com indicação tradicional — ótimo pra começar a tomar chá.',
  },
  'templates-notion': {
    title: 'Templates Notion',
    deliverable: '/entregaveis/templates-notion/templates-notion.html',
    tipD3: 'Faz o Tutorial primeiro (6 passos) — depois duplica o "Dashboard de Vida" pra ver a integração rolando.',
    tipD7: 'Marcou os templates como duplicados? A aba Meus Templates te ajuda a saber o que tá usando vs abandonado.',
  },
  'ebooks-autoajuda': {
    title: 'Coleção 5 Ebooks',
    deliverable: '/entregaveis/ebooks-autoajuda/index.html',
    tipD3: 'Comece pelo "A Arte da Disciplina" (60 páginas, 3h). Marca o tempo de leitura na aba Progresso pra ganhar streak.',
    tipD7: 'Já leu o primeiro? Cria notas na aba Notas — escrever 1-2 frases do que aprendeu fixa muito mais.',
  },
  'planilhas-financeiras': {
    title: 'Planilhas Financeiras',
    deliverable: '/entregaveis/planilhas-financeiras/planilhas-financeiras.html',
    tipD3: 'Preenche o Controle Mensal de hoje. Em 30 dias você vai descobrir pra onde teu dinheiro VAI MESMO.',
    tipD7: 'Tem dívida? Vai na aba Dívidas e simula bola-de-neve vs avalanche — descobre quanto economiza em juros.',
  },
}

function renderTipEmail({ name, tip, productTitle, productLink, isUpsell, upsellLink, daysAfter }) {
  const subject = isUpsell
    ? `${name?.split(' ')[0] || 'Olá'}, oferta de continuação (só hoje)`
    : `Dica rápida — ${productTitle} (${daysAfter}d depois)`

  const heroText = isUpsell
    ? 'Que tal levar o sistema completo?'
    : `Olá${name ? `, ${name.split(' ')[0]}` : ''}!`

  const bodyText = isUpsell
    ? `Faz 30 dias que você comprou ${productTitle}. Curtiu?<br><br>Tô liberando R$ 20 OFF no <strong>Kit Completo</strong> (todos os 6 produtos) pra clientes ativos.<br><br>Use o cupom <code style="background:#F4C430;color:#000;padding:2px 8px;border-radius:4px;font-weight:bold;">ATIVO20</code> no checkout — válido só hoje.`
    : tip

  const ctaText = isUpsell ? 'Ver Kit Completo' : `Abrir ${productTitle}`
  const ctaLink = isUpsell ? upsellLink : `${SITE}${productLink}`

  return {
    subject,
    html: `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0a0a0a;padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#111;border-radius:16px;border:1px solid #1f1f1f;overflow:hidden;">
        <tr><td align="center" style="padding:32px 40px 16px 40px;background:linear-gradient(135deg,#F4C430,#d4a017);">
          <div style="font-size:24px;font-weight:900;color:#000;letter-spacing:-0.5px;">Agência Criativa</div>
        </td></tr>
        <tr><td style="padding:32px 40px 16px 40px;">
          <h1 style="margin:0 0 16px 0;font-size:22px;font-weight:700;color:#fff;line-height:1.3;">${heroText}</h1>
          <div style="margin:0;font-size:15px;color:#d4d4d4;line-height:1.6;">${bodyText}</div>
        </td></tr>
        <tr><td align="center" style="padding:8px 40px 32px 40px;">
          <a href="${ctaLink}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#000;background:#F4C430;text-decoration:none;border-radius:12px;">${ctaText}</a>
        </td></tr>
        <tr><td align="center" style="padding:24px 40px;background:#0a0a0a;border-top:1px solid #1f1f1f;">
          <p style="margin:0;font-size:12px;color:#555;">© Agência Criativa · agenciacriativa.shop</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`,
  }
}

/**
 * Agenda 3 emails de follow-up via Resend (D+3, D+7, D+30).
 * Usa scheduled_at do Resend — não precisa de cron, eles enviam na hora.
 *
 * @param {object} params
 * @param {string} params.email
 * @param {string} params.name
 * @param {string[]} params.slugs — produtos comprados (pega o primeiro pra dica)
 */
export async function scheduleFollowUpSequence({ email, name, slugs, logPrefix = '[email]' }) {
  if (!process.env.RESEND_API_KEY) {
    console.warn(`${logPrefix} RESEND_API_KEY não configurado — pulando follow-up sequence`)
    return { ok: false }
  }

  // Pega o primeiro produto válido pra montar dicas
  const primarySlug = slugs.find((s) => PRODUCT_TIPS[s]) || 'receitas-low-carb'
  const product = PRODUCT_TIPS[primarySlug]

  // Calcula timestamps Unix
  const now = Date.now()
  const day3  = new Date(now + 3  * 24 * 60 * 60 * 1000).toISOString()
  const day7  = new Date(now + 7  * 24 * 60 * 60 * 1000).toISOString()
  const day30 = new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString()

  const upsellLink = `${SITE}/checkout/kit-completo?utm=followup_d30`

  const emails = [
    {
      ...renderTipEmail({ name, tip: product.tipD3, productTitle: product.title, productLink: product.deliverable, daysAfter: 3 }),
      scheduled_at: day3,
    },
    {
      ...renderTipEmail({ name, tip: product.tipD7, productTitle: product.title, productLink: product.deliverable, daysAfter: 7 }),
      scheduled_at: day7,
    },
    {
      ...renderTipEmail({ name, productTitle: product.title, isUpsell: true, upsellLink, daysAfter: 30 }),
      scheduled_at: day30,
    },
  ]

  const results = []
  for (const e of emails) {
    try {
      const r = await fetch(RESEND_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type':  'application/json',
        },
        body: JSON.stringify({
          from:         'Agência Criativa <noreply@agenciacriativa.shop>',
          to:           [email],
          subject:      e.subject,
          html:         e.html,
          scheduled_at: e.scheduled_at,
        }),
      })
      const data = await r.json().catch(() => null)
      if (!r.ok) {
        console.warn(`${logPrefix} agendar follow-up (${e.scheduled_at}):`, data?.message || r.status)
        results.push({ ok: false, error: data?.message || r.status })
      } else {
        console.log(`${logPrefix} follow-up agendado pra ${e.scheduled_at} (resend_id=${data?.id})`)
        results.push({ ok: true, resendId: data?.id, scheduled_at: e.scheduled_at })
      }
    } catch (err) {
      console.error(`${logPrefix} erro de rede agendando follow-up:`, err.message)
      results.push({ ok: false, error: err.message })
    }
  }

  const ok = results.every((r) => r.ok)
  return { ok, results }
}

// =============================================================================
// ABANDONED PIX RECOVERY — agenda lembrete em +1h se cliente não pagou
// =============================================================================
// Disparado quando Pix é criado. Se o cliente paga antes, o email ainda
// chega — mas com mensagem "se já pagou, ignore". UX aceitável.
//
// Pra cancelar quando pagar, precisaríamos persistir o resend_id e chamar
// Resend DELETE — overhead que não vale (taxa de no-show alta no Pix BR).

export async function scheduleAbandonedPixReminder({ email, name, slugs, paymentId, amount, qrCode, logPrefix = '[email]' }) {
  if (!process.env.RESEND_API_KEY) return { ok: false }

  const reminderTime = new Date(Date.now() + 60 * 60 * 1000).toISOString() // +1h
  const productList = slugs.length > 1 ? `${slugs.length} produtos` : 'seu produto'
  const firstName = (name || email.split('@')[0]).split(' ')[0]

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0a0a0a;padding:40px 20px;">
  <tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#111;border-radius:16px;border:1px solid #1f1f1f;overflow:hidden;">
      <tr><td align="center" style="padding:32px 40px 16px;background:linear-gradient(135deg,#F4C430,#d4a017);">
        <div style="font-size:24px;font-weight:900;color:#000;letter-spacing:-0.5px;">⏰ Não esquece do Pix!</div>
      </td></tr>
      <tr><td style="padding:32px 40px 16px;">
        <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#fff;line-height:1.3;">Olá, ${firstName}!</h1>
        <p style="margin:0 0 8px;font-size:15px;color:#d4d4d4;line-height:1.6;">Você gerou um Pix de <strong style="color:#F4C430;">R$ ${Number(amount).toFixed(2).replace('.', ',')}</strong> pra ${productList} mas ainda não recebemos o pagamento.</p>
        <p style="margin:0 0 8px;font-size:15px;color:#d4d4d4;line-height:1.6;">O QR Code <strong>ainda tá válido</strong>. Acesso liberado em segundos depois que você pagar.</p>
        <p style="margin:16px 0 0;font-size:13px;color:#888;line-height:1.5;"><strong>Já pagou?</strong> Pode ignorar esse email — provavelmente o acesso já chegou na sua caixa de entrada.</p>
      </td></tr>
      <tr><td align="center" style="padding:8px 40px 24px;">
        <a href="https://www.agenciacriativa.shop/p/${slugs[0] || 'receitas-low-carb'}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#000;background:#F4C430;text-decoration:none;border-radius:12px;">Voltar pra página do produto</a>
      </td></tr>
      <tr><td style="padding:0 40px 24px;">
        <details style="background:#1a1a1a;border-radius:12px;padding:16px;">
          <summary style="font-size:13px;color:#aaa;cursor:pointer;font-weight:bold;">Ver código Pix copia-e-cola</summary>
          <p style="margin:12px 0 0;font-size:11px;color:#888;font-family:monospace;word-break:break-all;line-height:1.5;">${qrCode}</p>
        </details>
      </td></tr>
      <tr><td align="center" style="padding:24px 40px;background:#0a0a0a;border-top:1px solid #1f1f1f;">
        <p style="margin:0;font-size:12px;color:#555;">© Agência Criativa · Pagamento ID ${paymentId}</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`

  try {
    const r = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        from:         'Agência Criativa <noreply@agenciacriativa.shop>',
        to:           [email],
        subject:      `${firstName}, seu Pix tá esperando ⏰`,
        html,
        scheduled_at: reminderTime,
      }),
    })
    const data = await r.json().catch(() => null)
    if (!r.ok) {
      console.warn(`${logPrefix} agendar Pix reminder:`, data?.message || r.status)
      return { ok: false, error: data?.message || r.status }
    }
    console.log(`${logPrefix} Pix reminder agendado pra +1h (resend_id=${data?.id})`)
    return { ok: true, resendId: data?.id }
  } catch (err) {
    console.error(`${logPrefix} erro de rede agendando Pix reminder:`, err.message)
    return { ok: false, error: err.message }
  }
}
