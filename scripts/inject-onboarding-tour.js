// =============================================================================
// INJECT ONBOARDING TOUR — adiciona tour nos 6 entregáveis SPA
// =============================================================================
// Usage: node scripts/inject-onboarding-tour.js
// =============================================================================

import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve('public/entregaveis')

const TOURS = {
  'receitas-low-carb/receitas-low-carb.html': {
    app: 'lowcarb',
    steps: [
      { icon: '🥗', title: 'Bem-vinda ao app Low Carb', body: 'Você não comprou um PDF — é um sistema funcional. Navega entre receitas, monta sua semana e gera lista de compras automaticamente.' },
      { icon: '📋', title: 'Aba Planejamento', body: 'Clica num slot de dia/refeição e escolhe uma receita. Em 2 minutos sua semana inteira tá montada.' },
      { icon: '🛒', title: 'Lista de Compras', body: 'Ela é gerada automaticamente do que você planejou. Marca os itens conforme compra. Compartilha no WhatsApp num clique.' },
      { icon: '📊', title: 'Tabela Nutricional + Guia', body: '40 alimentos low carb com macros. Guia completo da dieta. Tudo offline depois do primeiro acesso.' },
    ],
  },
  'planilhas-treino/planilhas-treino.html': {
    app: 'treino',
    steps: [
      { icon: '💪', title: 'Bem-vindo ao app de Treino', body: '12 semanas periodizadas pra você executar. Sem precisar de personal — o sistema te guia.' },
      { icon: '📅', title: 'Treino do Dia', body: 'Vê os exercícios de hoje, anota peso e reps em cada série, marca como concluído. O sistema calcula seu volume total.' },
      { icon: '📈', title: 'Aba Evolução', body: 'Em 2-3 semanas você vê gráficos da sua progressão de carga. Mede cintura/braço pra rastrear visualmente.' },
      { icon: '🏋️', title: 'Biblioteca de Exercícios', body: '49 exercícios com descrição, erro comum e link de vídeo. Não tem barra? A tabela de substituição te salva.' },
    ],
  },
  'planilhas-financeiras/planilhas-financeiras.html': {
    app: 'financeiras',
    steps: [
      { icon: '💰', title: 'Bem-vindo ao app Financeiro', body: 'Sai do vermelho de vez. Sistema com cálculo automático — você digita os números, ele te mostra exatamente o que fazer.' },
      { icon: '📊', title: 'Controle Mensal', body: 'Comece preenchendo o mês atual. 18 categorias de gastos. Em 30 dias você descobre pra onde seu dinheiro VAI.' },
      { icon: '❄️', title: 'Sair das Dívidas', body: 'Tem dívidas? Adiciona elas e o sistema mostra qual pagar primeiro (bola-de-neve ou avalanche) e quanto economiza em juros.' },
      { icon: '🎯', title: 'Reserva + Metas', body: 'Calcula sua reserva ideal e quanto guardar/mês. Define metas com prazo — o sistema diz se tá no caminho.' },
    ],
  },
  'receitas-indigenas/receitas-indigenas.html': {
    app: 'indigenas',
    steps: [
      { icon: '🌿', title: 'Bem-vinda ao app Indígena', body: 'Reconecte com sabores ancestrais brasileiros. 30 receitas autênticas + 35 plantas medicinais.' },
      { icon: '📋', title: 'Filtra por Região', body: 'Receitas de 5 regiões: Amazônia, Cerrado, Mata Atlântica, Pantanal, Caatinga. Filtra também por restrição (vegano, sem glúten).' },
      { icon: '🌱', title: 'Plantas Medicinais', body: 'Tabela com 35 plantas brasileiras: indicação tradicional, parte usada, modo de preparo. Filtros por benefício (digestivo, calmante, etc).' },
      { icon: '📚', title: 'Cultura & Guia', body: '5 cards educativos: princípios da culinária ancestral, mandioca (8 transformações), frutas nativas, pesca artesanal, calendário ancestral.' },
    ],
  },
  'templates-notion/templates-notion.html': {
    app: 'notion',
    steps: [
      { icon: '📋', title: 'Bem-vindo à galeria Notion', body: '20 templates Notion prontos pra duplicar. Sem precisar configurar nada do zero.' },
      { icon: '🎯', title: 'Faz o Tutorial primeiro', body: 'Se nunca usou Notion, vai na aba Tutorial. 6 passos rápidos te deixam pronto pra duplicar qualquer template.' },
      { icon: '🚀', title: 'Galeria de Templates', body: 'Clica num template, lê os detalhes, clica "Duplicar para meu Notion". Em 1 minuto tá funcionando na sua conta.' },
      { icon: '📂', title: 'Meus Templates', body: 'Marcou como duplicado? Aba "Meus Templates" rastreia status (ativo/abandonado) e deixa você criar notas pessoais por template.' },
    ],
  },
  'ebooks-autoajuda/index.html': {
    app: 'ebooks',
    steps: [
      { icon: '📚', title: 'Bem-vinda à Biblioteca', body: '5 ebooks brasileiros sobre disciplina, mentalidade, foco, limites e metas. Curtos, diretos, acionáveis.' },
      { icon: '📖', title: 'Comece pelo primeiro', body: '"A Arte da Disciplina" — 60 páginas, 3 horas. Cada capítulo termina com exercício prático. Você lê e aplica.' },
      { icon: '⏱️', title: 'Marca seu tempo de leitura', body: 'Aba Progresso tem botões 5/15/30/60min. Marcar te dá streak diário e desbloqueia conquistas.' },
      { icon: '🏆', title: 'Conquistas', body: 'Tem 10 conquistas pra desbloquear. Maratonista, Bibliófilo, Anotador, Semana de leitura. Pequenos goals que mantêm motivação.' },
    ],
  },
}

function escapeForJs(str) {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')
}

function injectTour(filePath, config) {
  const fullPath = path.join(ROOT, filePath)
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ Não encontrado: ${fullPath}`)
    return false
  }

  let html = fs.readFileSync(fullPath, 'utf-8')

  // Verifica se já injetou
  if (html.includes('OnboardingTour.start') || html.includes('onboarding-tour.js')) {
    console.log(`⏭  ${filePath} — já tem tour`)
    return false
  }

  // Monta o snippet
  const stepsJson = JSON.stringify(config.steps).replace(/'/g, "\\'")
  const snippet = `<script src="../_shared/onboarding-tour.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', function () {
    if (window.OnboardingTour) {
      window.OnboardingTour.start({
        app: '${config.app}',
        steps: ${stepsJson}
      });
    }
  });
</script>`

  // Insere antes do </body>
  if (html.includes('</body>')) {
    html = html.replace('</body>', `${snippet}\n</body>`)
  } else {
    html = html + '\n' + snippet
  }

  fs.writeFileSync(fullPath, html, 'utf-8')
  console.log(`✅ ${filePath} — tour injetado (${config.steps.length} steps)`)
  return true
}

console.log('Injetando onboarding tour nos 6 entregáveis...\n')

let count = 0
for (const [file, config] of Object.entries(TOURS)) {
  if (injectTour(file, config)) count++
}

console.log(`\n✨ ${count} arquivos atualizados.`)
