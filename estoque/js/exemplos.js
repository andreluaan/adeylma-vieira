// Dados de exemplo para a primeira vez que o sistema abre, para as telas e os gráficos não ficarem vazios.
// Tudo que é exemplo leva "exemplo: true" e some com o botão "Apagar exemplos" do Início.
import { dados } from './banco.js';
import { chaveDoMes } from './financeiro.js';

const PRODUTOS = [
  { nome: 'Sutiã renda', marca: "D'Luck", categoria: 'Sutiãs', custo: 32, preco: 69.9, qtd: 8, minimo: 3 },
  { nome: 'Sutiã básico', marca: 'Del Rayssa', categoria: 'Sutiãs', custo: 22, preco: 49.9, qtd: 2, minimo: 3 },
  { nome: 'Calcinha fio', marca: 'La Paola', categoria: 'Calcinhas', custo: 9, preco: 24.9, qtd: 20, minimo: 5 },
  { nome: 'Calcinha cintura alta', marca: "D'Luck", categoria: 'Calcinhas', custo: 14, preco: 34.9, qtd: 12, minimo: 4 },
  { nome: 'Conjunto rendado', ref: 'LP-2210', marca: 'La Paola', categoria: 'Conjuntos', custo: 55, preco: 119.9, qtd: 5, minimo: 2, tamanhos: { P: 1, M: 2, G: 2 } },
  { nome: 'Conjunto microfibra', marca: 'Del Rayssa', categoria: 'Conjuntos', custo: 42, preco: 89.9, qtd: 1, minimo: 2 },
  { nome: 'Pijama curto', ref: 'DL-0815', marca: "D'Luck", categoria: 'Pijamas', custo: 38, preco: 79.9, qtd: 6, minimo: 2, tamanhos: { P: 2, M: 3, G: 1 } },
  { nome: 'Camisola cetim', marca: 'La Paola', categoria: 'Pijamas', custo: 46, preco: 99.9, qtd: 4, minimo: 2 },
];

const CLIENTES = ['Maria', 'Joana', 'Ana', null, null];

// Peças vendidas de cada produto em cada um dos últimos 6 meses (do mais antigo ao atual)
const VENDAS_POR_MES = [
  [2, 3, 2, 4, 3, 2],
  [1, 2, 3, 2, 4, 1],
  [5, 6, 4, 8, 7, 5],
  [2, 2, 3, 3, 4, 2],
  [1, 1, 2, 1, 3, 1],
  [0, 1, 1, 2, 1, 1],
  [1, 0, 2, 1, 2, 1],
  [0, 1, 1, 1, 2, 0],
];

function vendasDeExemplo(produtos) {
  const hoje = new Date();
  const movimentos = [];
  produtos.forEach((p, indice) => {
    VENDAS_POR_MES[indice].forEach((qtd, mes) => {
      if (!qtd) return;
      const dia = Math.min(3 + indice * 3, mes === 5 ? hoje.getDate() : 28);
      const data = new Date(hoje.getFullYear(), hoje.getMonth() - (5 - mes), dia, 10 + indice).getTime();
      const base = { produtoId: p.id, produto: p.nome, marca: p.marca, categoria: p.categoria, preco: p.preco, custo: p.custo, exemplo: true };
      const cliente = CLIENTES[(indice + mes) % 5]; // algumas vendas sem cliente
      movimentos.push({ ...base, data, tipo: 'saida', qtd, ...(cliente && { cliente }) });
      // Reposição no começo do mês do que vai ser vendido
      const compra = new Date(hoje.getFullYear(), hoje.getMonth() - (5 - mes), 1, 9).getTime();
      movimentos.push({ ...base, data: compra, tipo: 'entrada', qtd });
    });
    // Compra inicial do que está no estoque hoje, no primeiro mês
    const inicial = new Date(hoje.getFullYear(), hoje.getMonth() - 5, 1, 8).getTime();
    movimentos.push({ produtoId: p.id, produto: p.nome, marca: p.marca, categoria: p.categoria, preco: p.preco, custo: p.custo, exemplo: true, data: inicial, tipo: 'entrada', qtd: p.qtd });
  });
  return movimentos.sort((a, b) => b.data - a.data);
}

export function criarExemplos() {
  const produtos = PRODUTOS.map((p, i) => ({ id: `exemplo-${i}`, foto: null, exemplo: true, ...p }));
  return {
    produtos,
    movimentos: vendasDeExemplo(produtos),
    categorias: [...new Set(PRODUTOS.map(p => p.categoria))],
    contas: [
      { id: 'exemplo-aluguel', nome: 'Aluguel', valor: 800, dia: 10, fixa: true, pagas: { [chaveDoMes()]: Date.now() }, exemplo: true },
      { id: 'exemplo-internet', nome: 'Internet', valor: 99.9, dia: 15, fixa: true, pagas: { [chaveDoMes()]: Date.now() }, exemplo: true },
      { id: 'exemplo-energia', nome: 'Energia', valor: 180, dia: 25, fixa: true, pagas: {}, exemplo: true },
    ],
    clientes: CLIENTES.filter(Boolean).map((nome, i) => ({
      id: `exemplo-cliente-${i}`, nome, telefone: `(85) 9 9${i}12-34${i}5`, observacao: '', criadaEm: Date.now(), exemplo: true,
    })),
    fiados: [
      { id: 'exemplo-fiado-1', cliente: 'Maria', descricao: '2× Calcinha fio', valor: 49.8, data: Date.now() - 6 * 864e5, recebidoEm: null, exemplo: true },
      { id: 'exemplo-fiado-2', cliente: 'Maria', descricao: '1× Sutiã renda', valor: 69.9, data: Date.now() - 2 * 864e5, recebidoEm: null, exemplo: true },
      { id: 'exemplo-fiado-3', cliente: 'Joana', descricao: '1× Camisola cetim', valor: 99.9, data: Date.now() - 864e5, recebidoEm: null, exemplo: true },
    ],
  };
}

const LISTAS = ['produtos', 'movimentos', 'contas', 'fiados', 'clientes'];

export const temExemplos = () => LISTAS.some(lista => dados[lista].some(item => item.exemplo));

export function apagarExemplos() {
  LISTAS.forEach(lista => { dados[lista] = dados[lista].filter(item => !item.exemplo); });
}
