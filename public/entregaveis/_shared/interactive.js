// =============================================================================
// INTERACTIVE.JS — torna planilhas estáticas editáveis e copiáveis
// =============================================================================
// O que faz:
//   1. Converte cada <span class="input-field"> em campo editável
//   2. Salva valores em localStorage (não perde se fechar)
//   3. Adiciona botão "📋 Copiar pra Sheets" em cada <table.fin-table>
//   4. Adiciona barra superior com "Limpar dados" e indicador de save
//
// Pra usar num entregável, basta incluir no <head>:
//   <link rel="stylesheet" href="../_shared/interactive.css">
//   <script defer src="../_shared/interactive.js"></script>
// =============================================================================

(function () {
  'use strict'

  // Detecta o "namespace" do entregável pelo path (planilhas-financeiras, etc)
  const NAMESPACE = location.pathname.split('/').filter(Boolean).slice(-2, -1)[0] || 'default'
  const STORAGE_KEY = `entregavel-${NAMESPACE}`

  // ---------------------------------------------------------------------------
  // 1. SAVE / LOAD inputs editáveis
  // ---------------------------------------------------------------------------

  function loadStore() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }
    catch { return {} }
  }

  function saveStore(store) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); return true }
    catch (e) { console.warn('localStorage cheio:', e.message); return false }
  }

  let saveTimer = null
  function debouncedSave(store, onSave) {
    clearTimeout(saveTimer)
    saveTimer = setTimeout(() => { saveStore(store); onSave?.() }, 400)
  }

  // ---------------------------------------------------------------------------
  // 2. CONVERTE .input-field em editáveis
  // ---------------------------------------------------------------------------

  function setupInputs() {
    const store = loadStore()
    const fields = document.querySelectorAll('.input-field')

    fields.forEach((el, idx) => {
      // Gera key estável: usa data-id do card mais próximo + índice na ordem
      const card = el.closest('.planilha-card')
      const cardId = card?.dataset.id || card?.querySelector('.planilha-number')?.textContent?.trim() || 'global'
      const key = `${cardId}::${idx}`
      el.dataset.key = key

      // Restaura valor salvo
      if (store[key] !== undefined && store[key] !== '') {
        el.textContent = store[key]
        el.classList.add('has-value')
      }

      // Torna editável
      el.contentEditable = 'true'
      el.spellcheck = false
      el.setAttribute('inputmode', el.textContent.includes('R$') ? 'decimal' : 'text')

      // Selectiona placeholder ao focar (se ainda for o default tipo "R$ 0,00")
      el.addEventListener('focus', () => {
        if (!el.classList.contains('has-value')) {
          requestAnimationFrame(() => {
            const range = document.createRange()
            range.selectNodeContents(el)
            const sel = getSelection()
            sel.removeAllRanges(); sel.addRange(range)
          })
        }
      })

      // Salva ao alterar
      el.addEventListener('input', () => {
        const val = el.textContent.trim()
        store[key] = val
        if (val !== '' && val !== 'R$ 0,00' && val !== '0' && val !== '—') {
          el.classList.add('has-value')
        } else {
          el.classList.remove('has-value')
        }
        debouncedSave(store, showSavedIndicator)
      })

      // Enter sai do campo (não cria nova linha)
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          el.blur()
        }
      })
    })
  }

  // ---------------------------------------------------------------------------
  // 3. COPIAR TABELA → TSV (Google Sheets)
  // ---------------------------------------------------------------------------

  function tableToTSV(table) {
    const rows = []
    table.querySelectorAll('tr').forEach((tr) => {
      const cells = []
      tr.querySelectorAll('th, td').forEach((cell) => {
        // Limpa quebras e tabs do conteúdo
        let text = cell.innerText.replace(/[\t\n\r]+/g, ' ').trim()
        // Remove "R$" pra ficar amigável com fórmulas (opcional — manter por enquanto)
        cells.push(text)
      })
      if (cells.length) rows.push(cells.join('\t'))
    })
    return rows.join('\n')
  }

  async function copyTSV(text, button) {
    try {
      await navigator.clipboard.writeText(text)
      const original = button.innerHTML
      button.innerHTML = '✓ Copiado!'
      button.classList.add('copied')
      setTimeout(() => {
        button.innerHTML = original
        button.classList.remove('copied')
      }, 2000)
    } catch {
      // Fallback: textarea + execCommand
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.left = '-9999px'
      document.body.appendChild(ta)
      ta.select()
      try { document.execCommand('copy') } catch {}
      document.body.removeChild(ta)
      button.innerHTML = '✓ Copiado!'
      setTimeout(() => button.innerHTML = '📋 Copiar pra Sheets', 2000)
    }
  }

  function setupCopyButtons() {
    const tables = document.querySelectorAll('table.fin-table, table.treino-table, table.planilha-table, table.exercise-table')
    tables.forEach((table) => {
      // Botão de copiar (antes da tabela)
      const btnWrapper = document.createElement('div')
      btnWrapper.className = 'copy-tsv-wrapper'
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = 'copy-tsv-btn'
      btn.innerHTML = '📋 Copiar pra Sheets'
      btn.title = 'Copia toda a tabela. Cole (Ctrl+V) no Google Sheets ou Excel.'
      btn.addEventListener('click', () => copyTSV(tableToTSV(table), btn))
      btnWrapper.appendChild(btn)
      table.parentNode.insertBefore(btnWrapper, table)

      // Wrapper de scroll horizontal (envolve a tabela pra mobile não cortar)
      // Só adiciona se o pai NÃO for já um wrapper de scroll (evita duplicar)
      if (!table.parentNode.classList.contains('table-scroll-wrap')) {
        const scrollWrap = document.createElement('div')
        scrollWrap.className = 'table-scroll-wrap'
        table.parentNode.insertBefore(scrollWrap, table)
        scrollWrap.appendChild(table)
      }
    })
  }

  // ---------------------------------------------------------------------------
  // 4. BARRA SUPERIOR (status + clear data)
  // ---------------------------------------------------------------------------

  function setupTopbar() {
    if (document.querySelector('.entregavel-topbar')) return

    const bar = document.createElement('div')
    bar.className = 'entregavel-topbar'
    bar.innerHTML = `
      <div class="entregavel-topbar-inner">
        <span class="entregavel-status">
          <span class="entregavel-status-dot"></span>
          <span class="entregavel-status-text">Pronto pra editar</span>
        </span>
        <button type="button" class="entregavel-clear" title="Apaga todos os dados que você preencheu">
          🗑️ Limpar dados
        </button>
      </div>
    `
    document.body.insertBefore(bar, document.body.firstChild)

    bar.querySelector('.entregavel-clear').addEventListener('click', () => {
      if (!confirm('Tem certeza? Vai apagar TODOS os valores que você preencheu nesse arquivo.')) return
      localStorage.removeItem(STORAGE_KEY)
      location.reload()
    })
  }

  function showSavedIndicator() {
    const text = document.querySelector('.entregavel-status-text')
    const dot = document.querySelector('.entregavel-status-dot')
    if (!text || !dot) return
    text.textContent = '✓ Salvo'
    dot.classList.add('saved')
    clearTimeout(showSavedIndicator._t)
    showSavedIndicator._t = setTimeout(() => {
      text.textContent = 'Pronto pra editar'
      dot.classList.remove('saved')
    }, 1500)
  }

  // ---------------------------------------------------------------------------
  // INIT
  // ---------------------------------------------------------------------------

  function init() {
    try {
      setupTopbar()
      setupInputs()
      setupCopyButtons()
      console.log('[interactive] inicializado em', NAMESPACE)
    } catch (err) {
      console.error('[interactive] erro:', err)
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
