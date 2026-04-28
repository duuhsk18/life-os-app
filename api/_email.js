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
