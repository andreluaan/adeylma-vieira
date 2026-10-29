// Pedaços de HTML usados em mais de uma tela.
import { icone } from './icones.js';
import { dataCurta, escapar, real } from './util.js';

export const total = (nomeIcone, rotulo, valor, classe = '', rodape = '') =>
  `<div class="total ${classe}">${icone(nomeIcone)}<small>${rotulo}</small><b>${valor}</b>${rodape}</div>`;

export const vazio = (nomeIcone, texto) => `<div class="vazio">${icone(nomeIcone)}<p>${texto}</p></div>`;

export function linhaMovimento(m) {
  const entrada = m.tipo === 'entrada';
  return `<div class="linha">
    <span class="mov ${m.tipo}">${icone(entrada ? 'arrow-up' : 'arrow-down')}</span>
    <span class="cresce">${escapar(m.produto)}<br><small>${dataCurta(m.data)}</small></span>
    <span class="valor"><b class="${m.tipo}">${entrada ? '+' : '−'}${m.qtd}</b>${entrada ? '' : `<br><small>${real(m.qtd * (m.preco ?? 0))}</small>`}</span>
  </div>`;
}

/** Um quadradinho por mês: vendido − custo das compras, dizendo se o mês fechou com lucro ou déficit. */
export function saldos(meses) {
  return `<div class="saldos">${meses.map(m => {
    const saldo = m.vendido - m.gasto;
    const positivo = saldo >= 0;
    const nome = escapar(m.nome ?? m.rotulo).replace(/^./, letra => letra.toUpperCase());
    if (!m.vendido && !m.gasto) {
      return `<div class="saldo parado"><b class="mes">${nome}</b><small>Sem movimento</small></div>`;
    }
    return `<div class="saldo ${positivo ? 'positivo' : 'negativo'}">
      <b class="mes">${nome}</b>
      <div class="conta-linha"><small>Vendido</small><span>${real(m.vendido)}</span></div>
      <div class="conta-linha"><small>Custo</small><span>− ${real(m.gasto)}</span></div>
      <div class="resultado">
        ${icone(positivo ? 'arrow-up' : 'arrow-down')}
        <span><small>${positivo ? 'Lucro' : 'Déficit'}</small><b>${real(Math.abs(saldo))}</b></span>
      </div>
    </div>`;
  }).join('')}</div>`;
}

// Séries do gráfico de colunas: vendido (bege da marca) e custo das compras (neutro)
export const SERIES_DINHEIRO = [
  { chave: 'vendido', nome: 'Vendido', classe: 'serie-vendido' },
  { chave: 'gasto', nome: 'Custo', classe: 'serie-gasto' },
];

/** Colunas lado a lado por ponto, com legenda; passar o mouse mostra os valores. */
export function colunas(pontos, series = SERIES_DINHEIRO) {
  const maior = Math.max(...pontos.flatMap(p => series.map(s => p[s.chave])), 1);
  const altura = valor => Math.max((valor / maior) * 100, valor ? 2 : 0);
  const legenda = `<div class="legenda">${series.map(s => `<span><i class="${s.classe}"></i>${s.nome}</span>`).join('')}</div>`;
  const dica = p => series.map(s => `${s.nome} ${real(p[s.chave])}`).join(' · ');
  return `${legenda}<div class="colunas" style="--pontos:${pontos.length}">${pontos.map(p => `
    <div class="coluna" tabindex="0">
      <span class="dica">${escapar(dica(p))}</span>
      <div class="pilha">${series.map(s => `<i class="${s.classe}" style="height:${altura(p[s.chave])}%"></i>`).join('')}</div>
      <small>${escapar(p.rotulo)}</small>
    </div>`).join('')}</div>`;
}

export function barras(grupos, formatar = real) {
  if (!grupos.length) return '<p class="nada">—</p>';
  const maior = Math.max(...grupos.map(g => g.valor), 1);
  return grupos.map(g => `<div class="linha">
    <span>${escapar(g.nome)}</span>
    <div class="trilho"><i style="width:${(g.valor / maior) * 100}%"></i></div>
    <small>${formatar(g.valor)}</small>
  </div>`).join('');
}

export const chips = (opcoes, ativo, atributo) => opcoes.map(({ valor, rotulo }) =>
  `<button type="button" class="chip ${ativo(valor) ? 'ativo' : ''}" data-${atributo}="${escapar(valor)}">${escapar(rotulo)}</button>`).join('');
