// =============================================================================
// AUTH GATE — bloqueia entregáveis pra quem não tem acesso
// =============================================================================
// Carregado SÍNCRONO no <head> de cada entregável. Roda ANTES do body renderizar.
//
// Lógica:
//   1. Detecta o slug do produto pela URL (ex: /entregaveis/templates-notion/...)
//   2. Lê sessão Supabase do localStorage (chave sb-<ref>-auth-token)
//   3. Sem token → mostra tela de login
//   4. Com token → chama /api/check-entitlement
//   5. Sem entitlement do slug → mostra tela "acesso negado"
//   6. Com entitlement → libera a página (remove overlay)
//
// CSS: depende de _shared/interactive.css ter as classes .ag-* (já incluídas)
// =============================================================================

(function () {
  'use strict'

  // ---------------------------------------------------------------------------
  // Detecta slug do entregável pela URL
  // ---------------------------------------------------------------------------
  const pathMatch = location.pathname.match(/\/entregaveis\/([^\/]+)\//)
  if (!pathMatch) return // não é entregável protegido

  const SLUG = pathMatch[1]

  // Não bloqueia recursos compartilhados (manifests, sw, etc)
  if (SLUG === '_shared') return

  // ---------------------------------------------------------------------------
  // Esconde body imediatamente — gate só libera quando confirmar acesso
  // ---------------------------------------------------------------------------
  const styleBlock = document.createElement('style')
  styleBlock.id = 'auth-gate-hide'
  styleBlock.textContent = `
    body { visibility: hidden !important; }
    body.auth-gate-pass { visibility: visible !important; }
    .auth-gate-overlay { position: fixed; inset: 0; z-index: 999999; display: flex;
      align-items: center; justify-content: center; padding: 24px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #000; visibility: visible !important; }
    .auth-gate-card { max-width: 440px; width: 100%; background: #0f0f0f;
      border: 1px solid rgba(244,196,48,0.2); border-radius: 24px;
      padding: 40px 32px; text-align: center; color: #fff;
      box-shadow: 0 20px 80px rgba(244,196,48,0.1); }
    .auth-gate-card .ag-icon { width: 56px; height: 56px; border-radius: 16px;
      margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;
      background: rgba(244,196,48,0.12); border: 1px solid rgba(244,196,48,0.25);
      font-size: 28px; }
    .auth-gate-card h1 { font-size: 22px; font-weight: 800; margin: 0 0 8px;
      line-height: 1.3; }
    .auth-gate-card p { font-size: 14px; color: #aaa; line-height: 1.6;
      margin: 0 0 24px; }
    .auth-gate-card .ag-btn { display: inline-block; padding: 14px 28px;
      border-radius: 14px; font-weight: 800; font-size: 14px; text-decoration: none;
      background: #F4C430; color: #000; cursor: pointer; border: none;
      transition: transform 0.15s, box-shadow 0.15s; font-family: inherit;
      letter-spacing: 0.2px; }
    .auth-gate-card .ag-btn:hover { transform: translateY(-1px);
      box-shadow: 0 8px 24px rgba(244,196,48,0.3); }
    .auth-gate-card .ag-link { display: block; margin-top: 16px; font-size: 12px;
      color: #666; text-decoration: none; }
    .auth-gate-card .ag-link:hover { color: #aaa; }
    .auth-gate-card .ag-spinner { width: 32px; height: 32px; border-radius: 50%;
      border: 3px solid rgba(244,196,48,0.2); border-top-color: #F4C430;
      animation: ag-spin 0.7s linear infinite; margin: 0 auto; }
    @keyframes ag-spin { to { transform: rotate(360deg); } }
    .auth-gate-card .ag-secondary { background: rgba(255,255,255,0.05);
      color: #ccc; border: 1px solid rgba(255,255,255,0.1); }
    .auth-gate-card .ag-secondary:hover { background: rgba(255,255,255,0.1); }
  `
  document.head.appendChild(styleBlock)

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------
  const SITE = location.origin
  const NEXT = encodeURIComponent(location.pathname + location.search)

  function ensureBody(callback) {
    if (document.body) callback()
    else document.addEventListener('DOMContentLoaded', callback)
  }

  function renderOverlay(html) {
    ensureBody(() => {
      const existing = document.getElementById('auth-gate-overlay')
      if (existing) existing.remove()
      const overlay = document.createElement('div')
      overlay.id = 'auth-gate-overlay'
      overlay.className = 'auth-gate-overlay'
      overlay.innerHTML = html
      document.body.appendChild(overlay)
    })
  }

  function showLoading() {
    renderOverlay(`
      <div class="auth-gate-card">
        <div class="ag-spinner"></div>
        <p style="margin-top: 18px;">Verificando seu acesso…</p>
      </div>
    `)
  }

  function showLoginRequired() {
    renderOverlay(`
      <div class="auth-gate-card">
        <div class="ag-icon">🔒</div>
        <h1>Acesso restrito</h1>
        <p>Esse material faz parte da área de membros. Faça login pra continuar.</p>
        <a class="ag-btn" href="${SITE}/login?next=${NEXT}">Fazer login</a>
        <a class="ag-link" href="${SITE}/">← Voltar pra página inicial</a>
      </div>
    `)
  }

  function showNotEntitled(slugList) {
    const has = (slugList || []).length
    renderOverlay(`
      <div class="auth-gate-card">
        <div class="ag-icon" style="background:rgba(239,68,68,0.12);border-color:rgba(239,68,68,0.25)">🚫</div>
        <h1>Você não tem acesso a esse produto</h1>
        <p>${has ? 'Você está logado, mas este produto não faz parte da sua conta. Confira seus produtos abaixo.' : 'Sua conta ainda não tem nenhum produto. Confira o catálogo pra começar.'}</p>
        <a class="ag-btn" href="${SITE}/minha-conta">Ver meus produtos</a>
        <a class="ag-link" href="${SITE}/catalogo">Ver catálogo →</a>
      </div>
    `)
  }

  function showError(msg) {
    renderOverlay(`
      <div class="auth-gate-card">
        <div class="ag-icon" style="background:rgba(239,68,68,0.12);border-color:rgba(239,68,68,0.25)">⚠️</div>
        <h1>Erro de verificação</h1>
        <p>${msg || 'Não foi possível verificar seu acesso. Tente novamente em alguns segundos.'}</p>
        <a class="ag-btn" href="${SITE}/login?next=${NEXT}">Fazer login</a>
        <a class="ag-link" href="javascript:location.reload()">↻ Tentar novamente</a>
      </div>
    `)
  }

  function unlock() {
    ensureBody(() => {
      document.getElementById('auth-gate-overlay')?.remove()
      document.getElementById('auth-gate-hide')?.remove()
      document.body.classList.add('auth-gate-pass')
    })
  }

  // ---------------------------------------------------------------------------
  // Lê sessão Supabase do localStorage
  // Supabase storage key padrão: sb-<project-ref>-auth-token
  // ---------------------------------------------------------------------------
  function getSupabaseSession() {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k && /^sb-.+-auth-token$/.test(k)) {
          const raw = localStorage.getItem(k)
          if (!raw) continue
          const parsed = JSON.parse(raw)
          // Suporta tanto formato direto quanto envelopado
          const access_token = parsed?.access_token || parsed?.currentSession?.access_token
          const expires_at = parsed?.expires_at || parsed?.currentSession?.expires_at
          if (access_token) {
            // Verifica expiração (expires_at é em segundos UNIX)
            if (expires_at && expires_at * 1000 < Date.now()) return null
            return { access_token }
          }
        }
      }
    } catch (e) {
      console.warn('[auth-gate] erro lendo sessão:', e)
    }
    return null
  }

  // ---------------------------------------------------------------------------
  // Fluxo principal
  // ---------------------------------------------------------------------------
  showLoading()

  const session = getSupabaseSession()
  if (!session) {
    showLoginRequired()
    return
  }

  fetch(SITE + '/api/check-entitlement', {
    headers: { 'Authorization': 'Bearer ' + session.access_token },
  })
    .then(async (r) => {
      if (r.status === 401) {
        showLoginRequired()
        return null
      }
      if (!r.ok) {
        const msg = await r.text().catch(() => '')
        throw new Error(msg || `HTTP ${r.status}`)
      }
      return r.json()
    })
    .then((data) => {
      if (!data) return // already handled (401)
      if (Array.isArray(data.slugs) && data.slugs.includes(SLUG)) {
        unlock()
      } else {
        showNotEntitled(data.slugs)
      }
    })
    .catch((err) => {
      console.error('[auth-gate] erro:', err.message)
      showError(err.message)
    })
})()
