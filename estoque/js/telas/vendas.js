// Histórico por período: vendido, gasto com compras e lucro, com comparação e gráficos.
import { barras, chips, colunas, linhaMovimento, saldos, total, vazio } from '../componentes.js';
import {
  PERIODOS, ehMesEscolhido, intervalo, mesesDisponiveis, movimentosEntre, resumoDoPeriodo, resumoNoTempo, vendidoPor,
} from '../consultas.js';
import { $, real } from '../util.js';

const COMPARACAO = { mes: 'mês passado', ano: 'ano passado' };
const LIMITE_LISTA = 100;

let periodo = 'mes';

/** "+12% vs mês passado", ou nada quando não há o que comparar. */
function comparacao(atual, anterior, maiorEhMelhor = true) {
  const contra = ehMesEscolhido(periodo) ? 'mês anterior' : COMPARACAO[periodo];
  if (!contra || !anterior) return '';
  const variacao = Math.round(((atual - anterior) / anterior) * 100);
  const bom = maiorEhMelhor ? variacao >= 0 : variacao <= 0;
  return `<small class="${bom ? 'entrada' : 'saida'}">${variacao >= 0 ? '+' : ''}${variacao}% vs ${contra}</small>`;
}

function desenharFiltros() {
  $('#chipsPeriodo').innerHTML = chips(
    Object.entries(PERIODOS).map(([valor, rotulo]) => ({ valor, rotulo })),
    valor => valor === periodo,
    'periodo',
  );
  const escolha = $('#mesVendas');
  escolha.classList.toggle('ativo', ehMesEscolhido(periodo));
  escolha.innerHTML = '<option value="">Escolher mês</option>' + mesesDisponiveis()
    .map(({ valor, rotulo }) => `<option value="${valor}" ${valor === periodo ? 'selected' : ''}>${rotulo}</option>`).join('');
}

export function desenharVendas() {
  const faixa = intervalo(periodo);
  const movimentos = movimentosEntre(faixa);
  const soma = resumoDoPeriodo(movimentos);
  const anterior = resumoDoPeriodo(movimentosEntre(intervalo(periodo, 1)));

  desenharFiltros();

  $('#totaisVendas').innerHTML = [
    total('arrow-up', 'Vendido', real(soma.vendido), 'venda', comparacao(soma.vendido, anterior.vendido)),
    total('arrow-down', 'Custo', real(soma.gasto), 'gasto', comparacao(soma.gasto, anterior.gasto, false)),
    total('star', 'Lucro', real(soma.lucro), 'lucro', comparacao(soma.lucro, anterior.lucro)),
    total('grid', 'Peças vendidas', soma.pecas, 'venda'),
  ].join('');

  const pontos = resumoNoTempo(movimentos, faixa);
  $('#tituloGraficoVendas').textContent = pontos.length > 13 ? 'Por dia' : 'Por mês';
  $('#graficoVendas').innerHTML = colunas(pontos);

  // Saldo: no ano e em "Tudo", um quadradinho por mês; num mês só, o quadradinho daquele mês
  const porMes = pontos.length <= 13 || !Number.isFinite(faixa[1]);
  const nomeDoMes = new Date(faixa[0]).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  $('#saldosVendas').innerHTML = saldos(porMes ? pontos : [{ rotulo: nomeDoMes, ...soma }]);

  const vendas = movimentos.filter(m => m.tipo === 'saida');
  $('#vendasMarca').innerHTML = barras(vendidoPor(movimentos, 'marca'));
  $('#vendasCategoria').innerHTML = barras(vendidoPor(movimentos, 'categoria'));
  $('#listaVendas').innerHTML = vendas.length
    ? vendas.slice(0, LIMITE_LISTA).map(linhaMovimento).join('')
    : vazio('cart', 'Nenhuma venda neste período');
}

export function iniciarVendas() {
  $('#chipsPeriodo').addEventListener('click', evento => {
    const botao = evento.target.closest('[data-periodo]');
    if (!botao) return;
    periodo = botao.dataset.periodo;
    desenharVendas();
  });
  $('#mesVendas').onchange = evento => {
    periodo = evento.target.value || 'mes';
    desenharVendas();
  };
}
