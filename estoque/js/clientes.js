// Clientes: cadastro, o que cada uma comprou e quanto deve. Sem nada de tela.
//
// Cliente: { id, nome, telefone, observacao, criadaEm }
// As compras são as vendas (movimentos de saída) com `cliente`; a conta é o fiado em aberto dela.
// A ligação é pelo nome, sem diferenciar maiúsculas e minúsculas.
import { dados } from './banco.js';

const mesmoNome = (a = '', b = '') => a.trim().toLocaleLowerCase('pt-BR') === b.trim().toLocaleLowerCase('pt-BR');

export const buscarCliente = nome => dados.clientes.find(c => mesmoNome(c.nome, nome));

/** Devolve a cliente com esse nome, cadastrando se ainda não existir. */
export function garantirCliente(nome, extras = {}) {
  const existente = buscarCliente(nome);
  if (existente) return existente;
  const nova = { id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, nome: nome.trim(), telefone: '', observacao: '', criadaEm: Date.now(), ...extras };
  dados.clientes.push(nova);
  return nova;
}

export function atualizarCliente(id, { nome, telefone, observacao }) {
  const cliente = dados.clientes.find(c => c.id === id);
  const nomeAntigo = cliente.nome;
  Object.assign(cliente, { nome, telefone, observacao });
  // Trocou o nome: leva junto as compras e o fiado
  if (!mesmoNome(nomeAntigo, nome)) {
    dados.movimentos.filter(m => mesmoNome(m.cliente, nomeAntigo)).forEach(m => { m.cliente = nome; });
    dados.fiados.filter(f => mesmoNome(f.cliente, nomeAntigo)).forEach(f => { f.cliente = nome; });
  }
}

/** Só apaga quem não deve nada; as compras continuam no histórico de vendas. */
export function removerCliente(id) {
  const cliente = dados.clientes.find(c => c.id === id);
  if (contaDe(cliente.nome).deve > 0) return false;
  dados.clientes = dados.clientes.filter(c => c.id !== id);
  return true;
}

export const comprasDe = nome => dados.movimentos.filter(m => m.tipo === 'saida' && mesmoNome(m.cliente, nome));

export function contaDe(nome) {
  const fiados = dados.fiados.filter(f => mesmoNome(f.cliente, nome));
  const abertos = fiados.filter(f => !f.recebidoEm);
  return { abertos, pagos: fiados.filter(f => f.recebidoEm), deve: abertos.reduce((s, f) => s + f.valor, 0) };
}

export function resumoDaCliente(cliente) {
  const compras = comprasDe(cliente.nome);
  return {
    cliente,
    compras,
    totalComprado: compras.reduce((s, m) => s + m.qtd * (m.preco ?? 0), 0),
    pecas: compras.reduce((s, m) => s + m.qtd, 0),
    ultimaCompra: compras.length ? Math.max(...compras.map(m => m.data)) : null,
    deve: contaDe(cliente.nome).deve,
  };
}

/** Todas as clientes: primeiro quem deve, depois quem comprou por último. */
export const resumoDasClientes = () => dados.clientes.map(resumoDaCliente)
  .sort((a, b) => (b.deve > 0) - (a.deve > 0) || (b.ultimaCompra ?? b.cliente.criadaEm) - (a.ultimaCompra ?? a.cliente.criadaEm));

/** Clientes citadas em vendas ou fiado antes de existir o cadastro viram cadastro. Devolve true se criou alguma. */
export function cadastrarClientesCitadas() {
  const antes = dados.clientes.length;
  [...dados.fiados.map(f => f.cliente), ...dados.movimentos.map(m => m.cliente)]
    .filter(Boolean)
    .forEach(nome => garantirCliente(nome, { criadaEm: Date.now() }));
  return dados.clientes.length > antes;
}

export const nomesDasClientes = () => dados.clientes.map(c => c.nome).sort((a, b) => a.localeCompare(b, 'pt-BR'));
