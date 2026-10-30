// Contas sobre os dados, sem nada de tela.
import { dados } from './banco.js';

const unicos = lista => [...new Set(lista)].sort((a, b) => a.localeCompare(b, 'pt-BR'));
const DIA = 864e5;

/* Produtos */

// As listas salvas guardam marcas e categorias mesmo depois que o último produto delas é apagado
export const marcas = () => unicos([...dados.marcas, ...dados.produtos.map(p => p.marca)]);
export const categorias = () => unicos([...dados.categorias, ...dados.produtos.map(p => p.categoria)]);

/** Guarda a marca e a categoria do produto nas listas, se ainda não estiverem lá. */
export function lembrarMarcaECategoria({ marca, categoria }) {
  if (!dados.marcas.includes(marca)) dados.marcas.push(marca);
  if (!dados.categorias.includes(categoria)) dados.categorias.push(categoria);
}

const LISTA = { marca: 'marcas', categoria: 'categorias' };

export const quantosUsam = (campo, nome) => dados.produtos.filter(p => p[campo] === nome).length;

/** Adiciona uma marca ou categoria; devolve false se já existir. */
export function adicionarNaLista(campo, nome) {
  const lista = dados[LISTA[campo]];
  const jaExiste = (campo === 'marca' ? marcas() : categorias()).some(n => n.toLowerCase() === nome.toLowerCase());
  if (!nome || jaExiste) return false;
  lista.push(nome);
  return true;
}

/** Remove uma marca ou categoria que nenhum produto usa. */
export function removerDaLista(campo, nome) {
  dados[LISTA[campo]] = dados[LISTA[campo]].filter(n => n !== nome);
}

export const estaAcabando = produto => produto.qtd <= produto.minimo;
export const buscarProduto = id => dados.produtos.find(p => p.id === id);

export function somar(produtos) {
  return produtos.reduce((total, p) => ({
    pecas: total.pecas + p.qtd,
    custo: total.custo + p.custo * p.qtd,
    venda: total.venda + (p.preco ?? 0) * p.qtd, // sem preço ainda (nunca vendido): não entra
  }), { pecas: 0, custo: 0, venda: 0 });
}

export const lucro = ({ custo, venda }) => venda - custo;

/** Valor de venda em estoque agrupado por marca ou categoria. */
export function valorPor(campo) {
  const nomes = campo === 'marca' ? marcas() : categorias();
  return nomes
    .map(nome => ({ nome, valor: somar(dados.produtos.filter(p => p[campo] === nome)).venda }))
    .sort((a, b) => b.valor - a.valor);
}

/* Movimentos: saída = venda (pelo preço vendido); entrada = compra (pelo custo) */

const ehVenda = m => m.tipo === 'saida';
const ehCompra = m => m.tipo === 'entrada';
const valorVendido = m => m.qtd * (m.preco ?? 0);
const valorGasto = m => m.qtd * (m.custo ?? 0);
const lucroVendido = m => m.qtd * ((m.preco ?? 0) - (m.custo ?? 0));
const categoriaDaVenda = m => m.categoria ?? buscarProduto(m.produtoId)?.categoria ?? 'Sem categoria';
const somaDe = (lista, valor) => lista.reduce((soma, m) => soma + valor(m), 0);

/**
 * Toda peça que está no estoque ou já foi vendida precisa ter sido comprada.
 * Quando as compras registradas não fecham essa conta (produtos cadastrados antes de as compras contarem,
 * quantidade aumentada na edição), registra a compra que falta. Se o produto nunca teve compra, ela entra
 * na data do primeiro movimento dele (o estoque inicial); senão, entra hoje. Devolve true se registrou alguma.
 */
export function registrarComprasQueFaltam() {
  let registrou = false;
  dados.produtos.forEach(p => {
    const doProduto = dados.movimentos.filter(m => m.produtoId === p.id || (!m.produtoId && m.produto === p.nome));
    const comprado = somaDe(doProduto.filter(ehCompra), m => m.qtd);
    const vendido = somaDe(doProduto.filter(ehVenda), m => m.qtd);
    const faltam = p.qtd + vendido - comprado;
    if (faltam <= 0) return;
    dados.movimentos.push({
      data: comprado ? Date.now() : Math.min(...doProduto.map(m => m.data), Date.now()),
      produtoId: p.id, produto: p.nome, marca: p.marca, categoria: p.categoria,
      tipo: 'entrada', qtd: faltam, preco: p.preco, custo: p.custo,
      ...(p.exemplo && { exemplo: true }),
    });
    registrou = true;
  });
  if (registrou) dados.movimentos.sort((a, b) => b.data - a.data);
  return registrou;
}

export const movimentosEntre =([inicio, fim]) => dados.movimentos.filter(m => m.data >= inicio && m.data < fim);

export function resumoDoPeriodo(movimentos) {
  const vendas = movimentos.filter(ehVenda);
  return {
    vendido: somaDe(vendas, valorVendido),
    lucro: somaDe(vendas, lucroVendido),
    pecas: somaDe(vendas, m => m.qtd),
    gasto: somaDe(movimentos.filter(ehCompra), valorGasto),
  };
}

/** Valor vendido por marca ou categoria, do maior para o menor. */
export function vendidoPor(movimentos, campo) {
  const chave = campo === 'categoria' ? categoriaDaVenda : m => m.marca;
  const grupos = new Map();
  movimentos.filter(ehVenda).forEach(m => grupos.set(chave(m), (grupos.get(chave(m)) ?? 0) + valorVendido(m)));
  return [...grupos].map(([nome, valor]) => ({ nome, valor })).sort((a, b) => b.valor - a.valor);
}

/** Produtos com mais peças vendidas. */
export function maisVendidos(quantos = 5) {
  const porProduto = new Map();
  dados.movimentos.filter(ehVenda).forEach(m => porProduto.set(m.produto, (porProduto.get(m.produto) ?? 0) + m.qtd));
  return [...porProduto].map(([nome, valor]) => ({ nome, valor })).sort((a, b) => b.valor - a.valor).slice(0, quantos);
}

/* Períodos: cada um é [início, fim) em milissegundos */

// Além destes, o período pode ser um mês escolhido na lista: "2026-08"
export const PERIODOS = { mes: 'Este mês', ano: 'Este ano', tudo: 'Tudo' };
export const ehMesEscolhido = periodo => /^\d{4}-\d{2}$/.test(periodo);

const inicioDoMes = (data, recuo = 0) => new Date(data.getFullYear(), data.getMonth() - recuo, 1);
const nomeDoMes = data => data.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
const nomeCompletoDoMes = data => data.toLocaleDateString('pt-BR', { month: 'long' });

export function intervalo(periodo, recuo = 0) {
  if (periodo === 'tudo') return [0, Infinity];
  const base = ehMesEscolhido(periodo) ? new Date(`${periodo}-01T00:00`) : new Date();
  if (periodo === 'ano') return [new Date(base.getFullYear() - recuo, 0, 1), new Date(base.getFullYear() - recuo + 1, 0, 1)].map(d => d.getTime());
  return [inicioDoMes(base, recuo), inicioDoMes(base, recuo - 1)].map(d => d.getTime());
}

export const intervaloDoMesAtual = () => intervalo('mes');

/** Meses da lista de escolha: do atual até o mês do primeiro movimento. */
export function mesesDisponiveis() {
  const hoje = new Date();
  const primeiro = new Date(Math.min(...dados.movimentos.map(m => m.data), Date.now()));
  const quantos = (hoje.getFullYear() - primeiro.getFullYear()) * 12 + hoje.getMonth() - primeiro.getMonth() + 1;
  return Array.from({ length: quantos }, (_, i) => {
    const d = inicioDoMes(hoje, i);
    return {
      valor: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      rotulo: d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).replace(/^./, letra => letra.toUpperCase()),
    };
  });
}

/** Pontos do gráfico: um por dia (períodos de um mês) ou um por mês (ano e tudo). */
export function resumoNoTempo(movimentos, [inicio, fim]) {
  const porDia = fim - inicio <= 31 * DIA;
  const comeco = new Date(Number.isFinite(fim) ? inicio : Math.min(...movimentos.map(m => m.data), Date.now()));
  // Por mês, para no mês atual (sem meses que ainda não chegaram); por dia, mostra o mês inteiro
  const final = new Date(Number.isFinite(fim) && (porDia || fim <= Date.now()) ? fim - 1 : Date.now());
  const pontos = [];
  for (let d = porDia ? comeco : inicioDoMes(comeco); d <= final;) {
    const proximo = porDia ? new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1) : inicioDoMes(d, -1);
    pontos.push({
      rotulo: porDia ? String(d.getDate()) : nomeDoMes(d),
      nome: porDia ? null : nomeCompletoDoMes(d),
      ...resumoDoPeriodo(movimentos.filter(m => m.data >= d.getTime() && m.data < proximo.getTime())),
    });
    d = proximo;
  }
  return pontos;
}

/** Os últimos meses, do mais antigo ao atual. */
export function ultimosMeses(quantos = 6) {
  const hoje = new Date();
  return Array.from({ length: quantos }, (_, i) => {
    const inicio = inicioDoMes(hoje, quantos - 1 - i);
    return { rotulo: nomeDoMes(inicio), nome: nomeCompletoDoMes(inicio), ...resumoDoPeriodo(movimentosEntre([inicio.getTime(), inicioDoMes(inicio, -1).getTime()])) };
  });
}
