import { dados } from '../banco.js';
import { chips, total } from '../componentes.js';
import { lucro, marcas, somar } from '../consultas.js';
import { $, escapar, real } from '../util.js';

// Nenhuma marca escolhida = todas
const escolhidas = new Set();

export function desenharValores() {
  const todas = marcas();
  [...escolhidas].filter(m => !todas.includes(m)).forEach(m => escolhidas.delete(m));
  const visiveis = escolhidas.size ? todas.filter(m => escolhidas.has(m)) : todas;
  const produtos = dados.produtos.filter(p => visiveis.includes(p.marca));

  $('#chipsMarca').innerHTML = chips(
    [{ valor: '', rotulo: 'Todas' }, ...todas.map(m => ({ valor: m, rotulo: m }))],
    valor => (valor ? escolhidas.has(valor) : !escolhidas.size),
    'marca',
  );

  const soma = somar(produtos);
  $('#totais').innerHTML = [
    total('grid', 'Peças', soma.pecas),
    total('arrow-down', 'Custo', real(soma.custo)),
    total('arrow-up', 'Venda', real(soma.venda)),
    total('star', 'Lucro', real(lucro(soma)), 'lucro'),
  ].join('');

  $('#tabelaMarcas').innerHTML = '<tr><th>Marca</th><th>Peças</th><th>Custo</th><th>Venda</th><th>Lucro</th></tr>' +
    visiveis.map(marca => {
      const s = somar(dados.produtos.filter(p => p.marca === marca));
      return `<tr><td>${escapar(marca)}</td><td>${s.pecas}</td><td>${real(s.custo)}</td><td>${real(s.venda)}</td><td class="entrada">${real(lucro(s))}</td></tr>`;
    }).join('');

  $('#tabelaProdutos').innerHTML = '<tr><th>Produto</th><th>Custo</th><th>Preço</th><th>Lucro</th><th>Qtd</th></tr>' +
    produtos.map(p => `<tr>
      <td>${escapar(p.nome)}<br><small>${escapar(p.marca)}</small></td>
      <td>${real(p.custo)}</td><td>${real(p.preco)}</td><td class="entrada">${real(p.preco - p.custo)}</td><td>${p.qtd}</td>
    </tr>`).join('');
}

export function iniciarValores() {
  $('#chipsMarca').addEventListener('click', evento => {
    const botao = evento.target.closest('[data-marca]');
    if (!botao) return;
    const marca = botao.dataset.marca;
    if (!marca) escolhidas.clear();
    else if (escolhidas.has(marca)) escolhidas.delete(marca);
    else escolhidas.add(marca);
    desenharValores();
  });
}
