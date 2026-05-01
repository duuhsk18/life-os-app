// =============================================================================
// ONBOARDING TOUR — primeira vez nos apps de entregáveis
// =============================================================================
// Mostra 3-4 dicas overlay quando o cliente abre o app pela primeira vez.
// Não invasivo: pode pular, fecha com X, mostra só uma vez por app.
//
// Uso (em cada app SPA):
//   <script src="../_shared/onboarding-tour.js"></script>
//   <script>
//     OnboardingTour.start({
//       app: 'lowcarb',
//       steps: [
//         { title: 'Bem-vindo!', body: 'Esse é seu app de receitas...' },
//         { title: 'Aba Receitas', body: 'Filtra, busca, clica pra ver.' },
//         ...
//       ]
//     });
//   </script>
// =============================================================================

(function () {
  if (typeof window === 'undefined') return
  if (window.OnboardingTour) return

  const STYLE = `
    .ob-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.85); z-index:99999; display:flex; align-items:center; justify-content:center; padding:24px; backdrop-filter:blur(8px); }
    .ob-card { background:#111; border:1px solid #2a2a2a; border-radius:20px; max-width:440px; width:100%; padding:28px; position:relative; box-shadow:0 24px 64px rgba(0,0,0,0.5); }
    .ob-close { position:absolute; top:16px; right:16px; width:32px; height:32px; border-radius:50%; background:rgba(255,255,255,0.06); border:none; color:#aaa; cursor:pointer; font-size:18px; display:flex; align-items:center; justify-content:center; }
    .ob-close:hover { background:rgba(255,255,255,0.12); color:#fff; }
    .ob-progress { display:flex; gap:6px; margin-bottom:20px; }
    .ob-dot { flex:1; height:4px; border-radius:2px; background:rgba(255,255,255,0.1); transition:background 0.3s; }
    .ob-dot.active { background:#F4C430; }
    .ob-dot.done { background:#22c55e; }
    .ob-icon { width:56px; height:56px; border-radius:14px; background:rgba(244,196,48,0.1); border:1px solid rgba(244,196,48,0.3); display:flex; align-items:center; justify-content:center; margin-bottom:16px; font-size:28px; }
    .ob-title { font-size:22px; font-weight:900; color:#fff; margin-bottom:10px; line-height:1.3; }
    .ob-body { font-size:15px; color:#bbb; line-height:1.6; margin-bottom:24px; }
    .ob-actions { display:flex; gap:10px; align-items:center; }
    .ob-btn { padding:12px 20px; border-radius:10px; font-weight:700; font-size:14px; cursor:pointer; border:none; transition:transform 0.1s; }
    .ob-btn:active { transform:scale(0.97); }
    .ob-btn-primary { background:#F4C430; color:#000; flex:1; }
    .ob-btn-primary:hover { background:#fad14a; }
    .ob-btn-skip { background:transparent; color:#666; border:1px solid rgba(255,255,255,0.1); }
    .ob-btn-skip:hover { color:#aaa; }
    @media (max-width: 480px) {
      .ob-card { padding:24px; }
      .ob-title { font-size:20px; }
    }
  `

  const root = {
    init: false,
    container: null,
    state: { steps: [], current: 0, app: null },
  }

  function injectStyle() {
    if (document.getElementById('ob-style')) return
    const s = document.createElement('style')
    s.id = 'ob-style'
    s.textContent = STYLE
    document.head.appendChild(s)
  }

  function render() {
    const { steps, current, app } = root.state
    const step = steps[current]
    if (!step) return finish()

    const progress = steps
      .map((_, i) => `<div class="ob-dot ${i < current ? 'done' : i === current ? 'active' : ''}"></div>`)
      .join('')

    const isLast = current === steps.length - 1
    const ctaText = isLast ? '✓ Vamos lá' : 'Próximo →'

    root.container.innerHTML = `
      <div class="ob-overlay" role="dialog" aria-modal="true">
        <div class="ob-card">
          <button class="ob-close" aria-label="Fechar tour">×</button>
          <div class="ob-progress">${progress}</div>
          <div class="ob-icon">${step.icon || '✨'}</div>
          <h2 class="ob-title">${step.title}</h2>
          <p class="ob-body">${step.body}</p>
          <div class="ob-actions">
            ${current > 0 ? '<button class="ob-btn ob-btn-skip" data-action="prev">← Voltar</button>' : ''}
            ${!isLast ? '<button class="ob-btn ob-btn-skip" data-action="skip">Pular</button>' : ''}
            <button class="ob-btn ob-btn-primary" data-action="next">${ctaText}</button>
          </div>
        </div>
      </div>
    `

    root.container.querySelector('.ob-close').addEventListener('click', finish)
    root.container.querySelectorAll('[data-action]').forEach((el) => {
      el.addEventListener('click', (e) => {
        const action = e.target.dataset.action
        if (action === 'next') {
          if (isLast) finish()
          else { root.state.current++; render() }
        } else if (action === 'prev') {
          root.state.current--; render()
        } else if (action === 'skip') {
          finish()
        }
      })
    })
  }

  function finish() {
    if (root.container) {
      root.container.remove()
      root.container = null
    }
    if (root.state.app) {
      try {
        localStorage.setItem(`ob:${root.state.app}:done`, Date.now().toString())
      } catch (e) {}
    }
  }

  function shouldShow(app) {
    try {
      return !localStorage.getItem(`ob:${app}:done`)
    } catch (e) {
      return false
    }
  }

  function start(opts) {
    if (!opts || !opts.app || !Array.isArray(opts.steps) || opts.steps.length === 0) return
    if (!shouldShow(opts.app)) return

    injectStyle()
    root.state.steps = opts.steps
    root.state.current = 0
    root.state.app = opts.app

    root.container = document.createElement('div')
    document.body.appendChild(root.container)
    render()
  }

  function reset(app) {
    try { localStorage.removeItem(`ob:${app}:done`) } catch (e) {}
  }

  window.OnboardingTour = { start, reset }
})()
