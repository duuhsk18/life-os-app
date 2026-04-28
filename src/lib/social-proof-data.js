export const NAMES = [
  'Ana Oliveira','João Silva','Maria Santos','Pedro Souza','Carla Lima',
  'Lucas Ferreira','Fernanda Costa','Rafael Alves','Juliana Rocha','Thiago Martins',
  'Camila Pereira','Marcos Gomes','Patrícia Ribeiro','André Cardoso','Beatriz Mendes',
  'Bruno Araújo','Letícia Nascimento','Rodrigo Cavalcanti','Larissa Freitas','Diego Moreira',
  'Vanessa Castro','Felipe Barbosa','Amanda Teixeira','Gustavo Correia','Priscila Monteiro',
  'Eduardo Lopes','Tatiane Pinto','Matheus Dias','Renata Sousa','Vitor Carvalho',
  'Sabrina Cunha','Leandro Pires','Natalia Vieira','Alessandro Nunes','Adriana Farias',
  'Henrique Aguiar','Simone Brito','Caio Azevedo','Luciana Machado','Fábio Marques',
  'Daniela Borges','Gabriel Coelho','Sandra Tavares','Alex Moraes','Roberta Campos',
  'Ivan Andrade','Viviane Nogueira','Nelson Queiroz','Elaine Paiva','Marco Duarte',
  'Cristina Reis','Paulo Ferraz','Kelly Ramos','Sandro Braga','Aline Melo',
  'Yuri Fonseca','Cláudia Leite','Jonas Batista','Mariane Silveira','Tiago Matos',
  'Elisa Franco','Otávio Monteiro','Rachel Brito','Igor Cavalcante','Débora Neves',
  'Wallace Sampaio','Cintia Moura','Léo Figueiredo','Alessandra Prado','Hugo Marcelino',
  'Natasha Lima','Breno Santos','Isis Carvalho','Márcio Andrade','Giovana Ferreira',
  'Raul Magalhães','Taísa Rodrigues','César Abreu','Mirela Dantas','Renato Godoi',
  'Jéssica Luz','Sérgio Rangel','Monique Chaves','Diogo Estrela','Carolina Menezes',
  'Arthur Barros','Luana Guimarães','Robson Pinheiro','Veridiana Cruz','Celso Ramos',
  'Talita Fontes','Wesley Couto','Juliana Almeida','Leonardo Assis','Patricia Lauro',
]

export const CITIES = [
  'São Paulo - SP','Rio de Janeiro - RJ','Belo Horizonte - MG','Curitiba - PR',
  'Porto Alegre - RS','Salvador - BA','Fortaleza - CE','Recife - PE',
  'Manaus - AM','Belém - PA','Goiânia - GO','Florianópolis - SC',
  'Maceió - AL','Natal - RN','Campo Grande - MS','Teresina - PI',
  'São Luís - MA','João Pessoa - PB','Aracaju - SE','Porto Velho - RO',
  'Macapá - AP','Boa Vista - RR','Palmas - TO','Rio Branco - AC',
  'Vitória - ES','Campinas - SP','São José dos Campos - SP','Ribeirão Preto - SP',
  'Londrina - PR','Joinville - SC','Uberlândia - MG','Feira de Santana - BA',
  'Juiz de Fora - MG','Santos - SP','São José do Rio Preto - SP','Mogi das Cruzes - SP',
  'Contagem - MG','Sorocaba - SP','Maringá - PR','Aparecida de Goiânia - GO',
  'Betim - MG','Serra - ES','Caxias do Sul - RS','Ananindeua - PA',
  'Olinda - PE','Osasco - SP','Diadema - SP','Carapicuíba - SP',
  'São Bernardo do Campo - SP','Santo André - SP',
]

export const PRODUCT_NAMES = [
  'Receitas Low Carb','Planilhas de Treino','Receitas Indígenas',
  'Templates Notion','Ebooks de Autoajuda','Planilhas Financeiras',
  'Life OS','Kit Completo',
]

export function randomEntry() {
  const name  = NAMES[Math.floor(Math.random() * NAMES.length)]
  const city  = CITIES[Math.floor(Math.random() * CITIES.length)]
  const product = PRODUCT_NAMES[Math.floor(Math.random() * PRODUCT_NAMES.length)]
  return { name, city, product }
}
