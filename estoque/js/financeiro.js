// Contas do mês (a pagar) e fiado de clientes (a receber), sem nada de tela.
//
// Conta: { id, nome, valor, dia, fixa, pagas: { '2026-10': quandoPagou } }
//   fixa = se repete todo mês; senão vale só para o mês em que foi criada (mesCriada).
// Fiado: { id, cliente, descricao, valor, data, recebidoEm }
import { dados } from './banco.js';

export const chaveDoMes = (data = new Date()) => `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
const novoId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/* Contas a pagar */

export const contasDoMes = (mes = chaveDoMes()) => dados.contas
  .filter(c => c.fixa || c.mesCriada === mes)
  .sort((a, b) => a.dia - b.dia);

export const estaPaga = (conta, mes = chaveDoMes()) => Boolean(conta.pagas?.[mes]);

/** "atrasada" quando o dia já passou e não foi paga; "hoje"; "paga"; "aberta". */
export function situacaoDaConta(conta, mes = chaveDoMes()) {
  if (estaPaga(conta, mes)) return 'paga';
  if (mes !== chaveDoMes()) return mes < chaveDoMes() ? 'atrasada' : 'aberta';
  const hoje = new Date().getDate();
  if (conta.dia < hoje) return 'atrasada';
  return conta.dia === hoje ? 'hoje' : 'aberta';
}

export function adicionarConta({ nome, valor, dia, fixa }) {
  dados.contas.push({ id: novoId(), nome, valor, dia, fixa, mesCriada: chaveDoMes(), pagas: {} });
}

export function alternarPagamento(id, mes = chaveDoMes()) {
  const conta = dados.contas.find(c => c.id === id);
  conta.pagas ??= {};
  if (conta.pagas[mes]) delete conta.pagas[mes];
  else conta.pagas[mes] = Date.now();
}

export const removerConta = id => { dados.contas = dados.contas.filter(c => c.id !== id); };

export function resumoDasContas(mes = chaveDoMes()) {
  const contas = contasDoMes(mes);
  const total = contas.reduce((s, c) => s + c.valor, 0);
  const pago = contas.filter(c => estaPaga(c, mes)).reduce((s, c) => s + c.valor, 0);
  return { total, pago, falta: total - pago, atrasadas: contas.filter(c => situacaoDaConta(c, mes) === 'atrasada').length };
}

/* Fiado: quem está devendo */

export function registrarFiado({ cliente, descricao, valor }) {
  dados.fiados.unshift({ id: novoId(), cliente, descricao, valor, data: Date.now(), recebidoEm: null });
}

export function marcarRecebido(id) {
  const fiado = dados.fiados.find(f => f.id === id);
  fiado.recebidoEm = fiado.recebidoEm ? null : Date.now();
}

export const removerFiado = id => { dados.fiados = dados.fiados.filter(f => f.id !== id); };

/** Clientes com fiado em aberto, de quem deve mais para quem deve menos. */
export function devedores() {
  const porCliente = new Map();
  dados.fiados.filter(f => !f.recebidoEm).forEach(f => {
    const atual = porCliente.get(f.cliente) ?? { cliente: f.cliente, total: 0, compras: [] };
    atual.total += f.valor;
    atual.compras.push(f);
    porCliente.set(f.cliente, atual);
  });
  return [...porCliente.values()].sort((a, b) => b.total - a.total);
}

export const totalAReceber = () => dados.fiados.filter(f => !f.recebidoEm).reduce((s, f) => s + f.valor, 0);

export const recebidosRecentes = (quantos = 10) => dados.fiados.filter(f => f.recebidoEm)
  .sort((a, b) => b.recebidoEm - a.recebidoEm).slice(0, quantos);

export const clientesConhecidos = () => [...new Set(dados.fiados.map(f => f.cliente))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
