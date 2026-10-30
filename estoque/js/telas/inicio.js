import { dados, salvar } from '../banco.js';
import { barras, colunas, linhaMovimento, saldos, total } from '../componentes.js';
import {
  estaAcabando, intervaloDoMesAtual, maisVendidos, movimentosEntre, resumoDoPeriodo, somar, ultimosMeses, valorPor,
} from '../consultas.js';
import { apagarExemplos, temExemplos } from '../exemplos.js';
import { icone } from '../icones.js';
import { $, avisar, escapar, real } from '../util.js';

const LIMITE_LISTAS = 5;

export function desenharInicio() {
  $('#hoje').textContent = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  $('#avisoExemplos').hidden = !temExemplos();

  const mes = resumoDoPeriodo(movimentosEntre(intervaloDoMesAtual()));
  $('#totaisInicio').innerHTML = [
    total('arrow-up', 'Vendido no mês', real(mes.vendido), 'venda'),
    total('arrow-down', 'Custo no mês', real(mes.gasto), 'gasto'),
    total('star', 'Lucro no mês', real(mes.lucro), 'lucro'),
    total('grid', 'Peças no estoque', somar(dados.produtos).pecas),
  ].join('');

  const meses = ultimosMeses();
  $('#graficoMeses').innerHTML = colunas(meses);
  $('#saldosInicio').innerHTML = saldos(meses);
  $('#maisVendidos').innerHTML = barras(maisVendidos(), pecas => `${pecas} un.`);

  const acabando = dados.produtos.filter(estaAcabando).sort((a, b) => a.qtd - b.qtd).slice(0, LIMITE_LISTAS);
  $('#acabando').innerHTML = acabando.length
    ? acabando.map(p => `<div class="linha"><span class="cresce">${escapar(p.nome)}</span><b class="baixo">${p.qtd}</b></div>`).join('')
    : `<p class="nada">${icone('check-circle')}Tudo certo</p>`;

  const ultimos = dados.movimentos.slice(0, LIMITE_LISTAS);
  $('#ultimas').innerHTML = ultimos.length ? ultimos.map(linhaMovimento).join('') : '<p class="nada">—</p>';

  $('#barrasMarca').innerHTML = barras(valorPor('marca'));
  $('#barrasCategoria').innerHTML = barras(valorPor('categoria'));
}

export function iniciarInicio() {
  $('#apagarExemplos').onclick = async () => {
    if (!confirm('Apagar os produtos de exemplo?')) return;
    apagarExemplos();
    await salvar();
    avisar('Exemplos apagados');
  };
}
