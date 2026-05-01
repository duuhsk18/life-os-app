export const BIBLIOTECA_CONFIG = {
  title: 'Biblioteca',
  subtitle: 'Todos os seus sistemas e materiais em um só lugar.',
}

export const CATEGORIES = [
  { id: 'sistemas',    label: 'Meus Sistemas',          icon: '⚡', color: '#F4C430' },
  { id: 'treinos',     label: 'Planilhas de Treino',    icon: '💪', color: '#10b981' },
  { id: 'alimentacao', label: 'Alimentação & Receitas', icon: '🥗', color: '#f59e0b' },
  { id: 'indigenas',   label: 'Receitas Indígenas',     icon: '🌿', color: '#22c55e' },
  { id: 'notion',      label: 'Templates Notion',       icon: '📋', color: '#3b82f6' },
  { id: 'autoajuda',   label: 'Ebooks de Autoajuda',    icon: '📚', color: '#a855f7' },
  { id: 'financas',    label: 'Planilhas Financeiras',  icon: '💰', color: '#d4af37' },
]

export const BIBLIOTECA = {
  sistemas: {
    description: 'Seus 6 sistemas funcionais — apps completos, não PDFs. Acesse direto:',
    items: [
      {
        id: 'sis-low-carb',
        title: 'App Low Carb',
        description: '30 receitas + planejador semanal + lista de compras automática + tabela nutricional + guia. App completo no celular.',
        image: '/assets/products/receitas-low-carb.png',
        download_url: '/entregaveis/receitas-low-carb/receitas-low-carb.html',
        badge: 'Sistema',
      },
      {
        id: 'sis-treino',
        title: 'App Treino',
        description: '12 semanas periodizadas · 49 exercícios com vídeo · tracker de evolução · calendário interativo. Substitui personal.',
        image: '/assets/products/planilhas-treino.png',
        download_url: '/entregaveis/planilhas-treino/planilhas-treino.html',
        badge: 'Sistema',
      },
      {
        id: 'sis-financeiras',
        title: 'App Financeiro',
        description: 'Controle mensal · método bola-de-neve pra dívidas · reserva · metas · dashboard anual · calculadora MEI.',
        image: '/assets/products/planilhas-financeiras.png',
        download_url: '/entregaveis/planilhas-financeiras/planilhas-financeiras.html',
        badge: 'Sistema',
      },
      {
        id: 'sis-indigenas',
        title: 'App Indígena',
        description: '30 receitas ancestrais · 35 plantas medicinais · cultura · plano semanal · lista de compras com buy-links.',
        image: '/assets/products/receitas-indigenas.png',
        download_url: '/entregaveis/receitas-indigenas/receitas-indigenas.html',
        badge: 'Sistema',
      },
      {
        id: 'sis-notion',
        title: 'Galeria Notion',
        description: '20 templates curados · tutorial passo-a-passo · meus templates com notas · dashboard de vida.',
        image: '/assets/products/templates-notion.png',
        download_url: '/entregaveis/templates-notion/templates-notion.html',
        badge: 'Sistema',
      },
      {
        id: 'sis-ebooks',
        title: 'Biblioteca Ebooks',
        description: '5 ebooks · heatmap de leitura · notas · 10 conquistas gamificadas · áudio-versão.',
        image: '/assets/products/ebooks-autoajuda.png',
        download_url: '/entregaveis/ebooks-autoajuda/index.html',
        badge: 'Sistema',
      },
    ],
  },
  treinos: {
    description: 'Sistema de treino completo — 12 semanas periodizadas no app.',
    items: [
      { id: 'app-treino',            title: 'App Treino Completo',                            description: '12 semanas periodizadas · 49 exercícios · tracker · calendário · biblioteca completa.', image: '/assets/products/planilhas-treino.png', download_url: '/entregaveis/planilhas-treino/planilhas-treino.html', badge: 'Sistema' },
    ],
  },
  alimentacao: {
    description: 'Receitas saudáveis, práticas e saborosas para o seu dia a dia.',
    items: [
      { id: 'app-low-carb',       title: 'App Receitas Low Carb',     description: '30 receitas com macros, planejador semanal, lista de compras automática.', image: '/assets/products/receitas-low-carb.png', download_url: '/entregaveis/receitas-low-carb/receitas-low-carb.html', badge: 'Popular' },
      { id: 'receitas-fitness',   title: 'Receitas Fitness',           description: 'Em breve — refeições balanceadas pra quem treina.', image: null, download_url: null, badge: 'Em breve' },
    ],
  },
  indigenas: {
    description: 'Saberes naturais ancestrais que curam e fortalecem o corpo.',
    items: [
      { id: 'app-indigenas',      title: 'App Receitas Indígenas',     description: '30 receitas ancestrais + 35 plantas medicinais + cultura + plano semanal.', image: '/assets/products/receitas-indigenas.png', download_url: '/entregaveis/receitas-indigenas/receitas-indigenas.html', badge: 'Sistema' },
    ],
  },
  notion: {
    description: 'Templates prontos para organizar sua vida, trabalho e estudos no Notion.',
    items: [
      { id: 'app-notion',         title: 'Galeria 20 Templates Notion',  description: 'Galeria curada · tutorial passo-a-passo · meus templates com notas pessoais.', image: '/assets/products/templates-notion.png', download_url: '/entregaveis/templates-notion/templates-notion.html', badge: 'Sistema' },
    ],
  },
  autoajuda: {
    description: 'Ebooks para transformar sua mentalidade e alcançar seus objetivos.',
    items: [
      { id: 'app-ebooks',         title: 'App Biblioteca de Ebooks',     description: '5 ebooks · heatmap de leitura · notas · 10 conquistas gamificadas.',           image: '/assets/products/ebooks-autoajuda.png', download_url: '/entregaveis/ebooks-autoajuda/index.html', badge: 'Sistema' },
      { id: 'ebook-disciplina',   title: 'A Arte da Disciplina',         description: 'O método pra criar hábitos que duram e eliminar a procrastinação.',            image: null, download_url: '/entregaveis/ebooks-autoajuda/01-a-arte-da-disciplina.html', badge: 'Popular' },
      { id: 'ebook-mentalidade',  title: 'Mentalidade de Crescimento',   description: 'Como reprogramar crenças limitantes e desenvolver o mindset de sucesso.',       image: null, download_url: '/entregaveis/ebooks-autoajuda/02-mentalidade-de-crescimento.html', badge: null },
      { id: 'ebook-foco',         title: 'Foco Total',                   description: 'Sistema de produção profunda em era de notificações e distrações.',             image: null, download_url: '/entregaveis/ebooks-autoajuda/03-foco-total.html', badge: null },
      { id: 'ebook-poder-nao',    title: 'O Poder do Não',               description: 'Limites que liberam — diga não com clareza e proteja seu tempo.',                image: null, download_url: '/entregaveis/ebooks-autoajuda/04-o-poder-do-nao.html', badge: null },
      { id: 'ebook-90-dias',      title: 'Realização em 90 dias',        description: 'Método prático de metas trimestrais — quebre objetivos em sprints.',             image: null, download_url: '/entregaveis/ebooks-autoajuda/05-realizacao-em-90-dias.html', badge: null },
    ],
  },
  financas: {
    description: 'Sistema completo pra controlar, planejar e conquistar sua independência financeira.',
    items: [
      { id: 'app-financas',      title: 'App Financeiro Completo',      description: 'Controle mensal · dívidas · reserva · metas · dashboard anual · MEI. 6 abas.', image: '/assets/products/planilhas-financeiras.png', download_url: '/entregaveis/planilhas-financeiras/planilhas-financeiras.html', badge: 'Sistema' },
    ],
  },
}
