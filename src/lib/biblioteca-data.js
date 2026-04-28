export const BIBLIOTECA_CONFIG = {
  title: 'Biblioteca',
  subtitle: 'Todos os seus materiais em um só lugar.',
}

export const CATEGORIES = [
  { id: 'treinos',     label: 'Planilhas de Treino',    icon: '💪', color: '#10b981' },
  { id: 'alimentacao', label: 'Alimentação & Receitas', icon: '🥗', color: '#f59e0b' },
  { id: 'indigenas',   label: 'Receitas Indígenas',     icon: '🌿', color: '#22c55e' },
  { id: 'notion',      label: 'Templates Notion',       icon: '📋', color: '#3b82f6' },
  { id: 'autoajuda',   label: 'Ebooks de Autoajuda',    icon: '📚', color: '#a855f7' },
  { id: 'financas',    label: 'Planilhas Financeiras',  icon: '💰', color: '#d4af37' },
]

export const BIBLIOTECA = {
  treinos: {
    description: 'Treinos personalizados para seus objetivos — em casa ou na academia.',
    items: [
      { id: 'hipertrofia-full-body', title: 'Hipertrofia Full Body 3x — Iniciante',           description: '3 dias por semana, corpo inteiro, focado em ganho de massa.',         image: null, download_url: null, badge: null },
      { id: 'hipertrofia-ppl',       title: 'Hipertrofia Push Pull Legs 6x — Intermediário',  description: 'Divisão PPL clássica para máximo volume semanal.',                    image: null, download_url: null, badge: null },
      { id: 'emagrecimento-hiit',    title: 'Emagrecimento HIIT 20min — Iniciante',            description: 'Treino intervalado de alta intensidade para queimar gordura rápido.',  image: null, download_url: null, badge: 'Popular' },
      { id: 'emagrecimento-circuito',title: 'Emagrecimento Circuito Funcional — Avançado',    description: 'Circuito intenso com foco em gasto calórico e condicionamento.',       image: null, download_url: null, badge: null },
      { id: 'definicao-alta-rep',    title: 'Definição Alta Repetição — Intermediário',       description: 'Volume elevado para definição muscular e resistência.',                 image: null, download_url: null, badge: null },
      { id: 'funcional-bodyweight',  title: 'Funcional Bodyweight — Iniciante',               description: 'Sem equipamentos. Funciona em qualquer lugar.',                        image: null, download_url: null, badge: null },
      { id: 'funcional-core',        title: 'Funcional Core — Intermediário',                 description: 'Foco em core forte, postura e equilíbrio.',                           image: null, download_url: null, badge: null },
      { id: 'treino-academia-inter', title: 'Treino Academia — Intermediário',                description: 'Planilha completa para academia com progressão semanal.',              image: null, download_url: null, badge: null },
      { id: 'treino-casa-iniciante', title: 'Treino em Casa — Iniciante',                     description: 'Começa do zero, sem equipamentos, em casa mesmo.',                    image: null, download_url: null, badge: null },
      { id: 'ficha-pro',             title: 'Ficha de Treino PRO',                            description: 'Template premium para montar sua própria ficha personalizada.',        image: null, download_url: null, badge: 'PRO' },
      { id: 'bonus-guia-ali',        title: 'Bônus — Guia de Alimentação',                   description: 'Cardápio prático para potencializar resultados com receitas simples.', image: null, download_url: null, badge: 'Bônus' },
      { id: 'bonus-medidas',         title: 'Bônus — Planilha de Medidas',                   description: 'Acompanhe a evolução do corpo com gráficos automáticos.',              image: null, download_url: null, badge: 'Bônus' },
      { id: 'bonus-recuperacao',     title: 'Bônus — Protocolo de Recuperação',              description: 'Técnicas de descanso ativo, alongamento e mobilidade.',                image: null, download_url: null, badge: 'Bônus' },
    ],
  },
  alimentacao: {
    description: 'Receitas saudáveis, práticas e saborosas para o seu dia a dia.',
    items: [
      { id: 'receitas-lowcarb', title: 'Receitas Low Carb', description: 'Mais de 50 receitas com baixo carboidrato para emagrecer sem sofrimento.', image: null, download_url: null, badge: 'Popular' },
      { id: 'receitas-fitness', title: 'Receitas Fitness',  description: 'Refeições balanceadas para quem treina e quer manter a dieta.',            image: null, download_url: null, badge: null },
    ],
  },
  indigenas: {
    description: 'Saberes naturais ancestrais que curam e fortalecem o corpo.',
    items: [
      { id: 'receitas-indigenas-v1', title: 'Receitas Indígenas — Volume 1', description: 'Plantas medicinais, chás e preparos da medicina tradicional.', image: null, download_url: null, badge: null },
    ],
  },
  notion: {
    description: 'Templates prontos para organizar sua vida, trabalho e estudos no Notion.',
    items: [
      { id: 'notion-rotina',     title: 'Template Rotina Diária',        description: 'Organize o seu dia com blocos de tempo, prioridades e revisão noturna.',    image: null, download_url: null, badge: 'Novo' },
      { id: 'notion-projetos',   title: 'Template Gestão de Projetos',   description: 'Kanban completo para gerenciar projetos pessoais e profissionais.',         image: null, download_url: null, badge: null },
      { id: 'notion-financeiro', title: 'Template Financeiro no Notion', description: 'Controle de gastos, metas e investimentos em um workspace único.',          image: null, download_url: null, badge: null },
    ],
  },
  autoajuda: {
    description: 'Ebooks para transformar sua mentalidade e alcançar seus objetivos.',
    items: [
      { id: 'ebook-disciplina',  title: 'Disciplina Inabalável',      description: 'O método para criar hábitos que duram e eliminar a procrastinação.',            image: null, download_url: null, badge: 'Popular' },
      { id: 'ebook-mentalidade', title: 'Mentalidade de Crescimento', description: 'Como reprogramar crenças limitantes e desenvolver o mindset de sucesso.',       image: null, download_url: null, badge: null },
    ],
  },
  financas: {
    description: 'Planilhas para controlar, planejar e conquistar sua independência financeira.',
    items: [
      { id: 'fin-gastos',       title: 'Planilha Controle de Gastos',   description: 'Registre receitas, despesas e veja para onde vai cada real.',                image: null, download_url: null, badge: null },
      { id: 'fin-reserva',      title: 'Planilha Reserva de Emergência',description: 'Calcule e acompanhe a construção da sua reserva de segurança.',               image: null, download_url: null, badge: null },
      { id: 'fin-investimentos', title: 'Planilha de Investimentos',    description: 'Comparativo de aportes, rentabilidade e projeção de patrimônio.',             image: null, download_url: null, badge: 'Novo' },
    ],
  },
}
