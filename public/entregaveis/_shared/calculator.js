// =============================================================================
// CALCULATOR — torna as planilhas financeiras INTERATIVAS com cálculos reais
// =============================================================================
// Detecta padrões de fórmula nas células e computa em tempo real.
// Sem dependência externa — vanilla JS puro.
//
// Padrões suportados:
//   "= Renda × N%"       → renda total × N/100
//   "= Limite - Gasto"    → row.limite - row.gasto
//   "= Gasto / Renda"     → (row.gasto / renda) × 100
//   "= SOMA gastos"       → soma dos gastos da seção
//   "= Limite - Total"    → seção.limite - seção.total
//   "= Total / Renda"     → (seção.total / renda) × 100
//   "= SOMA(C3:C5)"       → soma dos inputs da coluna na seção (renda total)
//   "= Renda × 50%"       → renda × 0.50 (no subtotal)
//   "= Renda" no SALDO    → renda total
//   "= Total gastos"      → soma de TODOS os gastos do orçamento
//
// Cada <table.fin-table> é independente. O calculator processa cada uma
// separadamente, encontrando RENDA TOTAL pela primeira subtotal-row.
// =============================================================================

(function () {
  'use strict'

  const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
  const fmtPct = (n) => (isFinite(n) ? n.toFixed(1).replace('.', ',') + '%' : '—')

  /**
   * Lê valor numérico de um campo de input (.input-field), tira "R$" e converte vírgula
   */
  function readInputValue(el) {
    if (!el) return 0
    const text = (el.textContent || '').trim()
    // Remove "R$", espaços, troca vírgula por ponto
    const cleaned = text.replace(/R\$\s*/i, '').replace(/\./g, '').replace(',', '.').trim()
    const n = parseFloat(cleaned)
    return isFinite(n) ? n : 0
  }

  /**
   * Calcula uma <table.fin-table> inteira.
   * Estratégia:
   *  1. Encontra RENDA TOTAL = soma de todos inputs da PRIMEIRA seção (antes da
   *     primeira subtotal-row)
   *  2. Pra cada seção subsequente, processa linhas individuais e o subtotal
   *  3. Substitui texto das células com valores calculados
   */
  function processTable(table) {
    const rows = Array.from(table.querySelectorAll('tr'))
    if (rows.length === 0) return

    // Identifica seções: cada category-row inicia uma seção
    // A primeira é "RENDA TOTAL"
    const sections = parseSections(rows)
    if (sections.length === 0) return

    // Calcula renda total (primeira seção é renda)
    const rendaSection = sections[0]
    const renda = sumInputsInSection(rendaSection)

    // Atualiza a subtotal-row da renda
    if (rendaSection.subtotal) {
      const tds = rendaSection.subtotal.querySelectorAll('td')
      if (tds.length >= 3) {
        tds[2].textContent = fmt.format(renda)
      }
    }

    // Soma de TODOS os gastos pra meta de "saldo final"
    let totalGastosGeral = 0

    // Processa demais seções
    for (let i = 1; i < sections.length; i++) {
      const sec = sections[i]
      const rows = sec.dataRows

      let totalGastoSec = 0
      let totalLimiteSec = 0

      // Processa cada linha de gasto na seção
      rows.forEach((row) => {
        const tds = Array.from(row.querySelectorAll('td'))
        if (tds.length < 5) return

        // td[0] = nome | td[1] = limite | td[2] = gasto (input) | td[3] = saldo | td[4] = % total

        // 1. Limite ideal (parse "= Renda × N%")
        const limiteText = (tds[1].textContent || '').trim()
        const pctMatch = limiteText.match(/×\s*(\d+(?:[.,]\d+)?)\s*%/)
        let limite = NaN
        if (pctMatch) {
          const pct = parseFloat(pctMatch[1].replace(',', '.')) / 100
          limite = renda * pct
          if (renda > 0) {
            tds[1].textContent = fmt.format(limite)
            tds[1].classList.add('value-calculated')
          }
        }

        // 2. Gasto real (input do usuário)
        const inputCell = tds[2].querySelector('.input-field')
        const gasto = readInputValue(inputCell)
        totalGastoSec += gasto
        if (!isNaN(limite)) totalLimiteSec += limite

        // 3. Saldo = limite - gasto
        if (!isNaN(limite) && renda > 0) {
          const saldo = limite - gasto
          tds[3].textContent = fmt.format(saldo)
          tds[3].className = saldo >= 0 ? 'value-positive' : 'value-negative'
        }

        // 4. % do total = gasto / renda
        if (renda > 0) {
          const pct = (gasto / renda) * 100
          tds[4].textContent = fmtPct(pct)
        }
      })

      // Atualiza subtotal da seção
      if (sec.subtotal) {
        const stds = sec.subtotal.querySelectorAll('td')
        if (stds.length >= 5) {
          // Coluna "Limite Ideal" (subtotal): parse "= Renda × N%"
          const subLimiteText = (stds[1].textContent || '').trim()
          const subPctMatch = subLimiteText.match(/×\s*(\d+(?:[.,]\d+)?)\s*%/)
          let subLimite = totalLimiteSec
          if (subPctMatch) {
            subLimite = renda * (parseFloat(subPctMatch[1].replace(',', '.')) / 100)
            if (renda > 0) stds[1].textContent = fmt.format(subLimite)
          }
          // Coluna "Gasto Real" (subtotal): SOMA gastos
          stds[2].textContent = fmt.format(totalGastoSec)
          stds[2].classList.add('value-accent')
          // Coluna "Saldo" (subtotal): subLimite - totalGastoSec
          if (renda > 0) {
            const subSaldo = subLimite - totalGastoSec
            stds[3].textContent = fmt.format(subSaldo)
            stds[3].className = subSaldo >= 0 ? 'value-positive' : 'value-negative'
          }
          // Coluna "% do total" (subtotal): totalGastoSec / renda
          if (renda > 0) {
            stds[4].textContent = fmtPct((totalGastoSec / renda) * 100)
          }
        }
      }

      totalGastosGeral += totalGastoSec
    }

    // Linha "SALDO FINAL DO MÊS" (última subtotal-row, se existir)
    const saldoFinalRow = rows[rows.length - 1]
    if (saldoFinalRow && saldoFinalRow.classList.contains('subtotal-row')) {
      const tds = saldoFinalRow.querySelectorAll('td')
      const firstCell = (tds[0]?.textContent || '').toLowerCase()
      if (firstCell.includes('saldo final') || firstCell.includes('total geral')) {
        if (tds.length >= 5 && renda > 0) {
          // Coluna 1 (limite/renda)
          tds[1].textContent = fmt.format(renda)
          // Coluna 2 (total gastos)
          tds[2].textContent = fmt.format(totalGastosGeral)
          // Coluna 3 (renda - gastos = saldo final)
          const saldoFinal = renda - totalGastosGeral
          tds[3].textContent = fmt.format(saldoFinal)
          tds[3].className = saldoFinal >= 0 ? 'value-positive' : 'value-negative'
          // Coluna 4 (100% sempre)
          tds[4].textContent = '100%'
        }
      }
    }
  }

  /**
   * Quebra as linhas de uma tabela em seções baseadas nas category-row.
   * Retorna: [{ category, dataRows[], subtotal }]
   */
  function parseSections(rows) {
    const sections = []
    let current = null

    for (const row of rows) {
      if (row.classList.contains('category-row')) {
        // Nova seção
        if (current) sections.push(current)
        current = { category: row, dataRows: [], subtotal: null }
      } else if (row.classList.contains('subtotal-row')) {
        // Fim da seção atual (mas pode haver mais subtotais avulsos)
        if (current) {
          current.subtotal = row
          sections.push(current)
          current = null
        }
      } else if (current) {
        // Linha de dados dentro da seção
        current.dataRows.push(row)
      }
    }
    if (current) sections.push(current)
    return sections
  }

  /**
   * Soma os valores de inputs em todas as data rows de uma seção
   */
  function sumInputsInSection(section) {
    let total = 0
    for (const row of section.dataRows) {
      const input = row.querySelector('.input-field')
      if (input) total += readInputValue(input)
    }
    return total
  }

  /**
   * Recalcula TODAS as tabelas da página
   */
  function recalcAll() {
    document.querySelectorAll('table.fin-table').forEach(processTable)
  }

  // ---------------------------------------------------------------------------
  // INIT
  // ---------------------------------------------------------------------------

  function init() {
    // Recalcula no carregamento (já tem valores salvos pelo interactive.js)
    setTimeout(recalcAll, 100) // delay pra garantir que interactive.js carregou os valores

    // Recalcula sempre que um input muda
    document.addEventListener('input', (e) => {
      if (e.target.classList && e.target.classList.contains('input-field')) {
        recalcAll()
      }
    })

    // Recalcula também no blur (fim de edição)
    document.addEventListener('blur', (e) => {
      if (e.target.classList && e.target.classList.contains('input-field')) {
        recalcAll()
      }
    }, true)
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
