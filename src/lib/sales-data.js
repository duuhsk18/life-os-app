// Stripe Payment Links — LIVE MODE (produção)
// Gerados via scripts/stripe-bootstrap.js com sk_live_ key
const STRIPE_LINKS = {
  'receitas-low-carb':     'https://buy.stripe.com/7sY00jeibeBjfCLeG35sA00',
  'planilhas-treino':      'https://buy.stripe.com/eVqaEXca3ctb4Y77dB5sA01',
  'receitas-indigenas':    'https://buy.stripe.com/bJe14nfmf64Nair8hF5sA02',
  'templates-notion':      'https://buy.stripe.com/4gM7sL5LF1OxgGP0Pd5sA03',
  'ebooks-autoajuda':      'https://buy.stripe.com/14AdR9b5Z8cV8ajbtR5sA04',
  'planilhas-financeiras': 'https://buy.stripe.com/28E8wPeibbp7duD0Pd5sA05',
  'kit-completo':          'https://buy.stripe.com/00w8wPca3eBj9en0Pd5sA06',
  'life-os':               'https://buy.stripe.com/cNidR98XRbp7eyH0Pd5sA07',
}
const STRIPE = (slug) => STRIPE_LINKS[slug]

// Stripe Price IDs — necessários pra criar Checkout Sessions dinâmicas (com order bump)
// Match: gerados via scripts/stripe-bootstrap.js (LIVE mode)
export const STRIPE_PRICES = {
  'receitas-low-carb':     'price_1TRNu0Fl5Mui7NRgQHCV7etc',
  'planilhas-treino':      'price_1TRNu2Fl5Mui7NRg10yWSTRj',
  'receitas-indigenas':    'price_1TRNu3Fl5Mui7NRg6w5SFF3r',
  'templates-notion':      'price_1TRNu5Fl5Mui7NRgC43w62O2',
  'ebooks-autoajuda':      'price_1TRNu6Fl5Mui7NRgKgCaTdPj',
  'planilhas-financeiras': 'price_1TRNu8Fl5Mui7NRga8KDW8m5',
  'kit-completo':          'price_1TRNu9Fl5Mui7NRgXu4aRPLN',
  'life-os':               'price_1TRNuBFl5Mui7NRgrz7Z9pNy',
}

export const PRODUCTS = {
  'receitas-low-carb': {
    slug: 'receitas-low-carb',
    emoji: '🥗',
    image: '/assets/products/receitas-low-carb.png',
    // Vídeo do "Tudo que você vai receber" (scroll dentro do app/PDF). Auto-play, loop, sem som.
    // Quando estiver null, mostra a imagem (image) como fallback automático.
    // Pra ativar: suba o MP4 em public/assets/products/ e troque null por '/assets/products/seu-arquivo.mp4'
    // Recomendado: MP4 H.264, vertical 9:16 ou 4:5, 8-15s, < 5MB, sem áudio.
    whatYouGetVideo: '/assets/low-carb-preview.mp4',
    whatYouGetPoster: '/assets/products/receitas-low-carb.png',
    transformImage: '/assets/products/low-carb-antes-depois.png',
    title: 'O app low carb que finalmente vai te fazer emagrecer',
    subtitle: '30 receitas + planejador semanal + lista de compras automática + tabela nutricional + guia completo. Tudo num sistema funcional, no seu celular.',
    price: 27.90,
    installment: { times: 3, value: 9.30 },
    originalPrice: 97.00,
    checkoutUrl: STRIPE('receitas-low-carb'),
    color: 'from-green-600 to-emerald-500',
    badge: 'MAIS VENDIDO',
    category: 'alimentacao',
    // 4 pilares — sistema/app, não ebook
    benefits: [
      { icon: '📱', title: 'Sistema, não PDF', desc: 'Funciona no celular, tablet, computador. Online ou offline. Não precisa baixar nada.' },
      { icon: '🗓️', title: 'Planejador semanal', desc: 'Monta sua semana com 1 toque. Café, almoço, lanche, jantar — pronto pra seguir.' },
      { icon: '🛒', title: 'Lista de compras automática', desc: 'Escolheu suas receitas? Sua lista do mercado já tá pronta — agrupada por seção.' },
      { icon: '📊', title: 'Tabela nutricional + guia', desc: 'Saiba o que comer, quanto, e por quê. 40 alimentos analisados + guia completo low carb.' },
    ],
    // Mantém pain points pra seção dedicada (mulher 28-50, frustrada com dietas)
    painPoints: [
      'Você já começou a dieta segunda e desistiu na quarta — de novo?',
      'Olha pro espelho e não reconhece mais o seu corpo?',
      'Cansada de comer "frango com batata doce" todo santo dia?',
      'Não tem 2 horas livres pra ficar na cozinha — a vida é corrida?',
      'A balança trava e ninguém te explica o porquê?',
    ],
    whatYouGet: [
      { item: '30 receitas low carb com macros calculados (café, almoço, jantar, lanche)', value: 'R$47' },
      { item: 'Planejador semanal interativo — monte sua semana com 1 toque', value: 'R$39' },
      { item: 'Lista de compras automática — agrupada por seção do mercado', value: 'R$29' },
      { item: 'Tabela nutricional de 40 alimentos low carb (carbs, proteína, gordura, fibra)', value: 'R$25' },
      { item: 'Guia completo low carb — protocolo, alimentos SIM/NÃO, FAQ', value: 'R$25' },
      { item: 'Acesso pelo celular, tablet ou pc — funciona offline', value: 'R$19' },
      { item: 'BÔNUS: Compartilhar lista de compras direto no WhatsApp', value: 'R$10' },
    ],
    testimonials: [
      { name: 'Ana Paula, 38', city: 'São Paulo, SP', text: 'Perdi 8kg em 2 meses sem passar fome. Voltei a usar as roupas que tava guardando há 4 anos. Minha autoestima voltou.', stars: 5, avatar: '👩' },
      { name: 'Mariana, 42', city: 'Belo Horizonte, MG', text: 'Eu odiava cozinhar. Achava que comida saudável era cara e sem gosto. Esse guia mudou tudo — meu marido e meus filhos comem junto comigo.', stars: 5, avatar: '👩‍🦰' },
      { name: 'Carla, 31', city: 'Curitiba, PR', text: 'Em 3 semanas perdi 4kg e a barriga sumiu. O melhor: não senti fome NENHUMA VEZ. Recomendei pra todas as amigas do trabalho.', stars: 5, avatar: '👩‍🦱' },
    ],
    faq: [
      { q: 'É um ebook ou um app?', a: 'É um app — um sistema funcional que abre no navegador do celular, tablet ou pc. Não é um PDF estático. Você navega entre receitas, monta seu planejamento da semana, gera sua lista de compras automaticamente, consulta a tabela nutricional. Tudo sincronizado e editável.' },
      { q: 'Preciso baixar algum aplicativo na loja?', a: 'Não precisa. Funciona direto no navegador. Mas se quiser, dá pra "instalar" o atalho na tela inicial do celular pra abrir igual app.' },
      { q: 'Funciona offline?', a: 'Sim. Depois que você abrir uma vez com internet, o sistema fica salvo no seu celular e funciona offline.' },
      { q: 'Preciso saber cozinhar?', a: 'Não. As 30 receitas têm passo-a-passo simples e levam no máximo 30 minutos. Pensadas pra quem nunca pegou numa panela.' },
      { q: 'Vou passar fome?', a: 'Não. Low carb feito direito reduz a fome porque proteína e gordura boa saciam por horas. As receitas têm macros calculados pra você comer até ficar satisfeita.' },
      { q: 'Os ingredientes são caros?', a: 'Tudo no mercado da esquina. A lista de compras automática otimiza pra você gastar menos do que gastava antes.' },
      { q: 'Como recebo o acesso?', a: 'Imediato. Após o pagamento, link no email em até 2 minutos. Acesso vitalício, sem mensalidade.' },
      { q: 'Funciona pra diabéticos ou hipertensos?', a: 'Low carb é frequentemente recomendado pra controle glicêmico e pressão. Mas sempre consulte seu médico antes de mudar a alimentação.' },
      { q: 'E se eu não gostar?', a: 'Garantia incondicional de 7 dias. Manda um email e devolvemos 100% do valor, sem pergunta.' },
    ],
    relatedSlugs: ['receitas-indigenas', 'planilhas-financeiras', 'ebooks-autoajuda'],
  },

  'planilhas-treino': {
    slug: 'planilhas-treino',
    emoji: '💪',
    image: '/assets/products/planilhas-treino.png',
    title: 'Planilhas de Treino Prontas para Usar Hoje',
    subtitle: '12 semanas de treino estruturado — do iniciante ao avançado, academia ou casa',
    price: 27.90,
    installment: { times: 3, value: 9.30 },
    originalPrice: 97.00,
    checkoutUrl: STRIPE('planilhas-treino'),
    color: 'from-orange-600 to-amber-500',
    badge: 'MAIS COMPLETO',
    category: 'treinos',
    painPoints: [
      'Chega na academia e não sabe o que fazer?',
      'Treina há meses e não vê resultado?',
      'Não tem dinheiro para pagar personal?',
      'Quer treinar em casa mas não sabe como montar a sequência?',
    ],
    whatYouGet: [
      { item: '12 semanas de treino completo e periodizado', value: 'R$39' },
      { item: 'Versão academia + versão em casa', value: 'R$29' },
      { item: 'Vídeos de execução dos exercícios (QR Code)', value: 'R$19' },
      { item: 'Planilha de acompanhamento de evolução', value: 'R$9' },
      { item: 'Guia de nutrição pré e pós-treino', value: 'R$17' },
    ],
    testimonials: [
      { name: 'Ricardo M.', city: 'Rio de Janeiro, RJ', text: 'Usei a planilha por 3 meses e ganhei 4kg de massa. Melhor investimento de R$10!', stars: 5, avatar: '👨' },
      { name: 'Fernanda L.', city: 'Porto Alegre, RS', text: 'Treino em casa com dois filhos pequenos. A versão casa é perfeita para minha realidade!', stars: 5, avatar: '👩' },
      { name: 'Bruno T.', city: 'Brasília, DF', text: 'Finalmente entendi como montar uma progressão de treino. Simples e eficiente.', stars: 5, avatar: '👨‍🦱' },
    ],
    faq: [
      { q: 'Serve para iniciantes?', a: 'Sim! Temos versão iniciante, intermediário e avançado. Você escolhe de acordo com seu nível.' },
      { q: 'Precisa de equipamentos?', a: 'A versão casa usa apenas seu corpo (calistenia). A versão academia usa os equipamentos padrão.' },
      { q: 'Por quanto tempo terei acesso?', a: 'Acesso vitalício. Pague uma vez e use para sempre.' },
    ],
    relatedSlugs: ['receitas-low-carb', 'ebooks-autoajuda', 'planilhas-financeiras'],
  },

  'receitas-indigenas': {
    slug: 'receitas-indigenas',
    emoji: '🌿',
    image: '/assets/products/receitas-indigenas.png',
    title: 'Receitas Indígenas — A Sabedoria da Terra na Sua Mesa',
    subtitle: 'Mais de 60 receitas ancestrais com ingredientes simples, nutritivos e cheios de sabor',
    price: 27.90,
    installment: { times: 3, value: 9.30 },
    originalPrice: 97.00,
    checkoutUrl: STRIPE('receitas-indigenas'),
    color: 'from-amber-600 to-orange-500',
    badge: 'EXCLUSIVO',
    category: 'indigenas',
    painPoints: [
      'Cansada de comer sempre a mesma coisa?',
      'Quer se alimentar de forma mais natural e saudável?',
      'Sente que a comida industrializada está fazendo mal?',
      'Quer reconectar com sabores autênticos e cheios de história?',
    ],
    whatYouGet: [
      { item: '60+ receitas ancestrais com origem e história', value: 'R$29' },
      { item: 'Guia de ingredientes nativos (onde encontrar)', value: 'R$17' },
      { item: 'Benefícios medicinais de cada ingrediente', value: 'R$19' },
      { item: 'Versão vegana e sem glúten de cada receita', value: 'R$15' },
      { item: 'Dicionário de plantas medicinais brasileiras', value: 'R$9' },
    ],
    testimonials: [
      { name: 'Juliana F.', city: 'Manaus, AM', text: 'Redescobri sabores que minha avó fazia. Minha família amou cada receita!', stars: 5, avatar: '👩‍🦳' },
      { name: 'Tatiane B.', city: 'Florianópolis, SC', text: 'Comida saudável, gostosa e com história. Melhor compra da semana!', stars: 5, avatar: '👩' },
      { name: 'Marcos A.', city: 'Belém, PA', text: 'Incrível como ingredientes simples fazem pratos tão ricos. Recomendo muito!', stars: 5, avatar: '👨‍🦲' },
    ],
    faq: [
      { q: 'Os ingredientes são fáceis de encontrar?', a: 'Sim! Indicamos substitutos fáceis para ingredientes mais regionais. Você encontra a maioria no mercado local.' },
      { q: 'As receitas são difíceis de fazer?', a: 'Não! A culinária indígena é naturalmente simples. Poucas etapas, muito sabor.' },
      { q: 'Tem receitas para crianças?', a: 'Sim! Marcamos as receitas ideais para crianças e toda a família.' },
    ],
    relatedSlugs: ['receitas-low-carb', 'ebooks-autoajuda', 'templates-notion'],
  },

  'templates-notion': {
    slug: 'templates-notion',
    emoji: '📋',
    image: '/assets/products/templates-notion.png',
    title: 'Templates Notion que Transformam sua Produtividade',
    subtitle: '20 templates prontos para organizar sua vida, trabalho, estudos e finanças em um só lugar',
    price: 27.90,
    installment: { times: 3, value: 9.30 },
    originalPrice: 97.00,
    checkoutUrl: STRIPE('templates-notion'),
    color: 'from-pink-600 to-rose-500',
    badge: 'PRODUTIVIDADE',
    category: 'notion',
    painPoints: [
      'Tem 10 apps diferentes e ainda não consegue se organizar?',
      'Perde horas tentando configurar o Notion do zero?',
      'Esquece compromissos, tarefas e metas importantes?',
      'Quer centralizar tudo em um lugar mas não sabe como?',
    ],
    whatYouGet: [
      { item: '20 templates Notion prontos para duplicar', value: 'R$39' },
      { item: 'Dashboard de vida pessoal completo', value: 'R$19' },
      { item: 'Planejador semanal + mensal', value: 'R$15' },
      { item: 'Tracker de hábitos e metas', value: 'R$17' },
      { item: 'CRM pessoal para freelancers', value: 'R$29' },
    ],
    testimonials: [
      { name: 'Letícia C.', city: 'São Paulo, SP', text: 'Uso o Notion há 2 anos mas nunca fui tão organizada. Os templates economizaram horas de configuração!', stars: 5, avatar: '👩‍💻' },
      { name: 'Pedro H.', city: 'Recife, PE', text: 'Como freelancer, o template de CRM salvou minha vida. Clientes e projetos organizados em 5 minutos!', stars: 5, avatar: '👨‍💼' },
      { name: 'Roberta M.', city: 'Goiânia, GO', text: 'Finalmente saí do papel e centralizei tudo. Minha produtividade triplicou!', stars: 5, avatar: '👩‍🎨' },
    ],
    faq: [
      { q: 'Precisa pagar o Notion?', a: 'Não! Todos os templates funcionam na versão gratuita do Notion.' },
      { q: 'Sou iniciante no Notion. Consigo usar?', a: 'Sim! Cada template vem com um guia passo a passo de como duplicar e personalizar.' },
      { q: 'Funciona no celular?', a: 'O Notion tem app para iOS e Android. Você acessa seus templates em qualquer lugar.' },
    ],
    relatedSlugs: ['ebooks-autoajuda', 'planilhas-financeiras', 'planilhas-treino'],
  },

  'ebooks-autoajuda': {
    slug: 'ebooks-autoajuda',
    emoji: '🧠',
    image: '/assets/products/ebooks-autoajuda.png',
    title: 'Coleção de Ebooks de Autoajuda que Mudam Mentalidades',
    subtitle: '5 ebooks essenciais sobre mentalidade, foco, disciplina e realização pessoal',
    price: 27.90,
    installment: { times: 3, value: 9.30 },
    originalPrice: 97.00,
    checkoutUrl: STRIPE('ebooks-autoajuda'),
    color: 'from-violet-600 to-purple-500',
    badge: 'TRANSFORMADOR',
    category: 'autoajuda',
    painPoints: [
      'Sabe o que precisa fazer mas não consegue agir?',
      'Procrastina o dia inteiro e sente culpa à noite?',
      'Começa mil coisas e não termina nenhuma?',
      'Quer mudar de vida mas não sabe por onde começar?',
    ],
    whatYouGet: [
      { item: '"A Arte da Disciplina" — como criar hábitos que duram', value: 'R$19' },
      { item: '"Mentalidade de Crescimento" — pense como um vencedor', value: 'R$19' },
      { item: '"Foco Total" — elimine distração e faça o que importa', value: 'R$19' },
      { item: '"O Poder do Não" — limites que liberam', value: 'R$15' },
      { item: '"Realização em 90 dias" — método prático de metas', value: 'R$19' },
    ],
    testimonials: [
      { name: 'Carolina V.', city: 'Campinas, SP', text: 'Li os 5 ebooks em um mês e minha vida mudou. Clareza, foco e disciplina que nunca tive!', stars: 5, avatar: '👩‍🎓' },
      { name: 'Thiago R.', city: 'Salvador, BA', text: '"A Arte da Disciplina" mudou minha relação com o trabalho. Conteúdo denso em linguagem simples.', stars: 5, avatar: '👨' },
      { name: 'Aline P.', city: 'Fortaleza, CE', text: 'Vale cada centavo. Aplicando o método de 90 dias consegui minha primeira promoção!', stars: 5, avatar: '👩‍🦱' },
    ],
    faq: [
      { q: 'Em qual formato são os ebooks?', a: 'PDF otimizado para celular e computador. Leia onde quiser, quando quiser.' },
      { q: 'São traduções ou conteúdo original?', a: 'Conteúdo 100% original, escrito em português brasileiro para a nossa realidade.' },
      { q: 'Tenho acesso imediato?', a: 'Sim! Após o pagamento você recebe o link por e-mail em menos de 1 minuto.' },
    ],
    relatedSlugs: ['templates-notion', 'planilhas-financeiras', 'receitas-low-carb'],
  },

  'planilhas-financeiras': {
    slug: 'planilhas-financeiras',
    emoji: '💰',
    image: '/assets/products/planilhas-financeiras.png',
    title: 'Planilhas Financeiras para Sair do Vermelho de Vez',
    subtitle: '8 planilhas que organizam suas finanças, eliminam dívidas e fazem seu dinheiro sobrar',
    price: 27.90,
    installment: { times: 3, value: 9.30 },
    originalPrice: 97.00,
    checkoutUrl: STRIPE('planilhas-financeiras'),
    color: 'from-indigo-600 to-blue-500',
    badge: 'ESSENCIAL',
    category: 'financas',
    painPoints: [
      'Salário cai e some sem você saber para onde foi?',
      'Não consegue poupar nem R$50 por mês?',
      'Tem dívidas acumulando juros e não sabe como sair?',
      'Quer investir mas não tem controle do básico ainda?',
    ],
    whatYouGet: [
      { item: 'Planilha de controle mensal de gastos', value: 'R$15' },
      { item: 'Planejador para sair das dívidas (método bola de neve)', value: 'R$19' },
      { item: 'Calculadora de reserva de emergência', value: 'R$9' },
      { item: 'Planilha de metas financeiras anuais', value: 'R$15' },
      { item: 'Dashboard financeiro anual com gráficos', value: 'R$29' },
    ],
    testimonials: [
      { name: 'Sandra O.', city: 'São Paulo, SP', text: 'Em 4 meses usando a planilha quitei R$3.200 de dívida. Nunca mais passei no cheque especial!', stars: 5, avatar: '👩' },
      { name: 'Eduardo K.', city: 'Curitiba, PR', text: 'Finalmente entendi para onde meu dinheiro ia. Simples, visual e eficiente!', stars: 5, avatar: '👨‍💼' },
      { name: 'Priscila N.', city: 'Porto Alegre, RS', text: 'Com a calculadora de reserva emergencial consegui juntar meus primeiros R$2.000. Isso mudou tudo!', stars: 5, avatar: '👩‍🦰' },
    ],
    faq: [
      { q: 'As planilhas são no Excel ou Google Sheets?', a: 'Disponíveis nos dois formatos. Google Sheets é gratuito e funciona no celular.' },
      { q: 'Precisa saber de finanças para usar?', a: 'Não! As planilhas são autoexplicativas com instruções em cada aba.' },
      { q: 'Funciona para autônomo ou MEI?', a: 'Sim! Temos uma planilha específica para controle de receitas variáveis.' },
    ],
    relatedSlugs: ['templates-notion', 'ebooks-autoajuda', 'planilhas-treino'],
  },
}

export const ALL_PRODUCT_SLUGS = Object.keys(PRODUCTS)

export const getProduct = (slug) => PRODUCTS[slug] || null

export const getRelatedProducts = (slug) => {
  const product = PRODUCTS[slug]
  if (!product) return []
  return product.relatedSlugs.map(s => PRODUCTS[s]).filter(Boolean)
}

export const KIT_COMPLETO = {
  title: 'Kit Completo — Todos os 6 Produtos',
  description: 'Leve todos os produtos por um preço especial e transforme todas as áreas da sua vida',
  bumpPrice: 47.00,
  bumpInstallment: { times: 3, value: 15.67 },
  totalValue: 167.40,
  checkoutUrl: STRIPE('kit-completo'),
  items: ALL_PRODUCT_SLUGS.map(s => PRODUCTS[s].title),
}

export const LIFE_OS = {
  slug: 'life-os',
  emoji: '⚡',
  title: 'Life OS — Sistema Completo + Biblioteca dos 6 Produtos',
  subtitle: 'O único plano que entrega: app gamificado, biblioteca completa e novos materiais todo mês',
  price: 59.90,
  installment: { times: 3, value: 19.97 },
  monthlyAfter: 79.90,
  originalPrice: 127.00,
  description: 'Tudo em um só lugar: o sistema para executar (hábitos, treinos, journal, finanças) + a biblioteca completa com os 6 produtos + materiais novos todo mês. Cancele quando quiser.',
  checkoutUrl: STRIPE('life-os'),
  features: [
    'Acesso completo à biblioteca dos 6 produtos (Receitas Low Carb, Treinos, Indígenas, Templates, Ebooks, Financeiras)',
    'Novos materiais adicionados todo mês — sempre evoluindo',
    'App gamificado: tracker de hábitos com streak e XP',
    'Diário de treinos com histórico completo',
    'Controle financeiro integrado',
    'Sistema de metas com barra de progresso',
    'Journal diário com mood tracker',
    'Timer Pomodoro focado',
    'Sistema de gamificação com 10 níveis',
    'Dashboard de estatísticas em tempo real',
  ],
}
