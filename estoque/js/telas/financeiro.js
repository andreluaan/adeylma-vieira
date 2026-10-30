// Aba Financeiro: contas do mês (quanto e que dia paga) e fiado (de quem recebe).
import { salvar } from '../banco.js';
import { total, vazio } from '../componentes.js';
import {
  adicionarConta, alternarPagamento, chaveDoMes, contasDoMes, devedores, marcarRecebido,
  recebidosRecentes, registrarFiado, removerConta, resumoDasContas, situacaoDaConta, totalAReceber,
} from '../financeiro.js';
import { garantirCliente, nomesDasClientes } from '../clientes.js';
import { icone } from '../icones.js';
import { $, avisar, dataCurta, escapar, inteiro, numero, real } from '../util.js';

const ROTULO_SITUACAO = { paga: 'Paga', atrasada: 'Atrasada', hoje: 'Vence hoje', aberta: 'A pagar' };

async function persistir(mensagem) {
  try {
    await salvar();
    avisar(mensagem);
  } catch {
    avisar('Não consegui salvar!');
  }
}

function linhaConta(conta) {
  const situacao = situacaoDaConta(conta);
  return `<div class="linha conta-mes ${situacao}">
    <button type="button" class="marcar" data-pagar="${conta.id}" aria-label="${situacao === 'paga' ? 'Desmarcar' : 'Marcar como paga'}">
      ${situacao === 'paga' ? icone('check') : ''}
    </button>
    <span class="dia"><b>${conta.dia}</b><small>dia</small></span>
    <span class="cresce">${escapar(conta.nome)}<br><small class="situacao">${ROTULO_SITUACAO[situacao]}${conta.fixa ? ' · todo mês' : ''}</small></span>
    <b>${real(conta.valor)}</b>
    <button type="button" class="fechar" data-apagar-conta="${conta.id}" aria-label="Apagar conta">${icone('trash')}</button>
  </div>`;
}

function blocoDevedor({ cliente, total: deve, compras }) {
  return `<div class="devedor">
    <div class="linha"><span class="cresce"><b>${escapar(cliente)}</b></span><b class="saida">${real(deve)}</b></div>
    ${compras.map(f => `<div class="linha compra-fiado">
      <span class="cresce">${escapar(f.descricao)}<br><small>${dataCurta(f.data)}</small></span>
      <span>${real(f.valor)}</span>
      <button type="button" class="btn pequeno" data-receber="${f.id}">${icone('check')}Recebi</button>
    </div>`).join('')}
  </div>`;
}

export function desenharFinanceiro() {
  const contas = resumoDasContas();
  const nomeDoMes = new Date().toLocaleDateString('pt-BR', { month: 'long' });
  $('#mesFinanceiro').textContent = nomeDoMes.replace(/^./, l => l.toUpperCase());

  $('#totaisFinanceiro').innerHTML = [
    total('calendar', 'Contas do mês', real(contas.total)),
    total('check-circle', 'Já paguei', real(contas.pago), 'lucro'),
    total('alert', 'Falta pagar', real(contas.falta), contas.atrasadas ? 'alerta' : '',
      contas.atrasadas ? `<small class="saida">${contas.atrasadas} atrasada${contas.atrasadas > 1 ? 's' : ''}</small>` : ''),
    total('arrow-down', 'A receber (fiado)', real(totalAReceber()), 'receber'),
  ].join('');

  const lista = contasDoMes();
  $('#listaContas').innerHTML = lista.length ? lista.map(linhaConta).join('') : vazio('calendar', 'Nenhuma conta cadastrada');

  const quemDeve = devedores();
  $('#listaFiado').innerHTML = quemDeve.length ? quemDeve.map(blocoDevedor).join('') : vazio('check-circle', 'Ninguém devendo');

  const recebidos = recebidosRecentes();
  $('#listaRecebidos').innerHTML = recebidos.length
    ? recebidos.map(f => `<div class="linha">
        <span class="cresce">${escapar(f.cliente)}<br><small>${escapar(f.descricao)} · recebido ${dataCurta(f.recebidoEm)}</small></span>
        <span class="entrada">${real(f.valor)}</span>
        <button type="button" class="fechar" data-desfazer="${f.id}" aria-label="Desfazer">${icone('refresh')}</button>
      </div>`).join('')
    : '<p class="nada">—</p>';

  $('#sugestoesCliente').innerHTML = nomesDasClientes().map(c => `<option value="${escapar(c)}">`).join('');
}

function salvarConta() {
  const nome = $('#novaContaNome').value.trim();
  const valor = numero($('#novaContaValor').value);
  const dia = Math.min(31, Math.max(1, inteiro($('#novaContaDia').value)));
  if (!nome || !valor) return avisar('Escreva o nome e o valor da conta');
  adicionarConta({ nome, valor, dia, fixa: $('#novaContaFixa').checked });
  ['#novaContaNome', '#novaContaValor', '#novaContaDia'].forEach(campo => { $(campo).value = ''; });
  persistir('Conta adicionada');
}

function salvarFiado() {
  const cliente = $('#novoFiadoCliente').value.trim();
  const valor = numero($('#novoFiadoValor').value);
  if (!cliente || !valor) return avisar('Escreva a cliente e o valor');
  registrarFiado({ cliente: garantirCliente(cliente).nome, descricao: $('#novoFiadoDescricao').value.trim() || 'Compra', valor });
  ['#novoFiadoCliente', '#novoFiadoValor', '#novoFiadoDescricao'].forEach(campo => { $(campo).value = ''; });
  persistir(`Fiado de ${cliente} anotado`);
}

export function iniciarFinanceiro() {
  $('#adicionarConta').onclick = salvarConta;
  $('#adicionarFiado').onclick = salvarFiado;

  $('#financeiro').addEventListener('click', evento => {
    const { pagar, apagarConta, receber, desfazer } = evento.target.closest('button')?.dataset ?? {};
    if (pagar) {
      alternarPagamento(pagar, chaveDoMes());
      persistir('Conta atualizada');
    }
    if (apagarConta && confirm('Apagar esta conta?')) {
      removerConta(apagarConta);
      persistir('Conta apagada');
    }
    if (receber) {
      marcarRecebido(receber);
      persistir('Recebido');
    }
    if (desfazer) {
      marcarRecebido(desfazer);
      persistir('Voltou para "devendo"');
    }
  });
}

