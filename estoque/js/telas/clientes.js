// Aba Clientes: cadastro, quanto cada uma já comprou e quanto deve; a ficha mostra as compras e a conta.
import { salvar } from '../banco.js';
import {
  atualizarCliente, buscarCliente, contaDe, garantirCliente, removerCliente, resumoDaCliente, resumoDasClientes,
} from '../clientes.js';
import { linhaMovimento, total, vazio } from '../componentes.js';
import { marcarRecebido } from '../financeiro.js';
import { icone } from '../icones.js';
import { $, avisar, dataCurta, escapar, real } from '../util.js';

let fichaAberta = null; // id da cliente na ficha

async function persistir(mensagem) {
  try {
    await salvar();
    avisar(mensagem);
  } catch {
    avisar('Não consegui salvar!');
  }
}

const iniciais = nome => nome.split(/\s+/).slice(0, 2).map(p => p[0]).join('').toUpperCase();

function cartaoCliente({ cliente, totalComprado, pecas, ultimaCompra, deve }) {
  return `<button type="button" class="cliente" data-cliente="${cliente.id}">
    <span class="avatar">${escapar(iniciais(cliente.nome))}</span>
    <span class="cresce">
      <b>${escapar(cliente.nome)}</b>
      <small>${pecas ? `${pecas} peça${pecas > 1 ? 's' : ''} · ${real(totalComprado)}` : 'Nenhuma compra'}${ultimaCompra ? ` · última ${dataCurta(ultimaCompra)}` : ''}</small>
    </span>
    ${deve ? `<span class="deve"><small>Deve</small><b>${real(deve)}</b></span>` : `<span class="em-dia">${icone('check-circle')}</span>`}
  </button>`;
}

export function desenharClientes() {
  const todas = resumoDasClientes();
  const busca = $('#buscaCliente').value.trim().toLowerCase();
  const visiveis = todas.filter(r => !busca || `${r.cliente.nome} ${r.cliente.telefone}`.toLowerCase().includes(busca));
  const devendo = todas.filter(r => r.deve);

  $('#totaisClientes').innerHTML = [
    total('user', 'Clientes', todas.length),
    total('alert', 'Devendo', devendo.length, devendo.length ? 'alerta' : ''),
    total('arrow-down', 'A receber', real(devendo.reduce((s, r) => s + r.deve, 0))),
    total('cart', 'Já compraram', real(todas.reduce((s, r) => s + r.totalComprado, 0))),
  ].join('');

  $('#listaClientes').innerHTML = !todas.length
    ? vazio('user', 'Nenhuma cliente ainda')
    : visiveis.length ? visiveis.map(cartaoCliente).join('') : vazio('search', 'Nada encontrado');

  if (fichaAberta && $('#janelaCliente').open) desenharFicha();
}

/* Ficha da cliente */

function abrirFicha(id) {
  fichaAberta = id;
  const cliente = resumoDaCliente(dadosDaFicha()).cliente;
  $('#fichaNome').value = cliente.nome;
  $('#fichaTelefone').value = cliente.telefone ?? '';
  $('#fichaObservacao').value = cliente.observacao ?? '';
  desenharFicha();
  $('#janelaCliente').showModal();
}

const dadosDaFicha = () => resumoDasClientes().find(r => r.cliente.id === fichaAberta)?.cliente;

function desenharFicha() {
  const cliente = dadosDaFicha();
  if (!cliente) return $('#janelaCliente').close();
  const { compras, totalComprado, pecas } = resumoDaCliente(cliente);
  const conta = contaDe(cliente.nome);

  $('#fichaTitulo').textContent = cliente.nome;
  $('#fichaResumo').innerHTML = `
    <span><small>Comprou</small><b>${real(totalComprado)}</b></span>
    <span><small>Peças</small><b>${pecas}</b></span>
    <span class="${conta.deve ? 'saida' : 'entrada'}"><small>Deve</small><b>${real(conta.deve)}</b></span>`;

  $('#fichaConta').innerHTML = conta.abertos.length
    ? conta.abertos.map(f => `<div class="linha compra-fiado">
        <span class="cresce">${escapar(f.descricao)}<br><small>${dataCurta(f.data)}</small></span>
        <span>${real(f.valor)}</span>
        <button type="button" class="btn pequeno" data-receber="${f.id}">${icone('check')}Recebi</button>
      </div>`).join('')
    : `<p class="nada">${icone('check-circle')}Não deve nada</p>`;

  $('#fichaCompras').innerHTML = compras.length
    ? compras.map(linhaMovimento).join('')
    : '<p class="nada">Nenhuma compra registrada</p>';
}

function salvarFicha() {
  const nome = $('#fichaNome').value.trim();
  if (!nome) return avisar('Escreva o nome');
  const outra = buscarCliente(nome);
  if (outra && outra.id !== fichaAberta) return avisar('Já existe uma cliente com esse nome');
  atualizarCliente(fichaAberta, { nome, telefone: $('#fichaTelefone').value.trim(), observacao: $('#fichaObservacao').value.trim() });
  persistir('Cliente salva');
}

function apagarFicha() {
  const cliente = dadosDaFicha();
  if (!confirm(`Apagar ${cliente.nome}? As compras continuam no histórico de vendas.`)) return;
  if (!removerCliente(cliente.id)) return avisar(`${cliente.nome} ainda deve. Receba antes de apagar.`);
  $('#janelaCliente').close();
  persistir('Cliente apagada');
}

function adicionarCliente() {
  const nome = $('#novaClienteNome').value.trim();
  if (!nome) return avisar('Escreva o nome da cliente');
  if (buscarCliente(nome)) return avisar('Essa cliente já existe');
  garantirCliente(nome, { telefone: $('#novaClienteTelefone').value.trim() });
  $('#novaClienteNome').value = '';
  $('#novaClienteTelefone').value = '';
  persistir(`${nome} cadastrada`);
}

export function iniciarClientes() {
  $('#buscaCliente').oninput = desenharClientes;
  $('#adicionarCliente').onclick = adicionarCliente;
  $('#listaClientes').addEventListener('click', evento => {
    const botao = evento.target.closest('[data-cliente]');
    if (botao) abrirFicha(botao.dataset.cliente);
  });
  $('#fichaConta').addEventListener('click', evento => {
    const botao = evento.target.closest('[data-receber]');
    if (!botao) return;
    marcarRecebido(botao.dataset.receber);
    persistir('Recebido');
  });
  $('#salvarCliente').onclick = salvarFicha;
  $('#apagarCliente').onclick = apagarFicha;
  $('#fecharCliente').onclick = () => $('#janelaCliente').close();
}
