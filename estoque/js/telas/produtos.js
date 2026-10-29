import { dados, salvar } from '../banco.js';
import { chips, vazio } from '../componentes.js';
import { buscarProduto, categorias, estaAcabando, lembrarMarcaECategoria, marcas, registrarComprasQueFaltam } from '../consultas.js';
import { icone } from '../icones.js';
import { $, avisar, escapar, inteiro, numero, paraCampo, real } from '../util.js';

const TODAS = '';
const LADO_MAXIMO_FOTO = 500;

const filtro = { categoria: TODAS };
let editandoId = null;
let fotoAtual = null;
let movimento = null; // { id, tipo: 'entrada' | 'saida' }

async function persistir(mensagem) {
  try {
    await salvar();
    avisar(mensagem);
  } catch {
    avisar('Não consegui salvar!');
  }
}

/* Lista */

export function desenharProdutos() {
  const marcaEscolhida = $('#filtroMarca').value;
  $('#filtroMarca').innerHTML = `<option value="">Todas as marcas</option>` +
    marcas().map(m => `<option ${m === marcaEscolhida ? 'selected' : ''}>${escapar(m)}</option>`).join('');

  $('#chipsCategoria').innerHTML = chips(
    [{ valor: TODAS, rotulo: 'Todas' }, ...categorias().map(c => ({ valor: c, rotulo: c }))],
    valor => valor === filtro.categoria,
    'categoria',
  );

  const busca = $('#busca').value.trim().toLowerCase();
  const visiveis = dados.produtos.filter(p =>
    (filtro.categoria === TODAS || p.categoria === filtro.categoria) &&
    (!marcaEscolhida || p.marca === marcaEscolhida) &&
    (!busca || `${p.nome} ${p.marca}`.toLowerCase().includes(busca)));

  if (!dados.produtos.length) return void ($('#grade').innerHTML = vazio('grid', 'Nenhum produto'));
  if (!visiveis.length) return void ($('#grade').innerHTML = vazio('search', 'Nada encontrado'));
  $('#grade').innerHTML = visiveis.map(cartao).join('');
}

function cartao(p) {
  const acabando = estaAcabando(p);
  return `<article class="card">
    <div class="foto">
      ${p.foto ? `<img src="${p.foto}" alt="">` : icone('image')}
      <button class="editar" data-editar="${p.id}" aria-label="Editar">${icone('edit')}</button>
      ${acabando ? `<span class="selo" title="Acabando">${icone('alert')}</span>` : ''}
    </div>
    <div class="info">
      <div class="nome">${escapar(p.nome)}</div>
      <small>${escapar(p.marca)}</small>
      <b class="preco">${real(p.preco)}</b>
    </div>
    <div class="qtd">
      <button class="redondo" data-saida="${p.id}" aria-label="Tirar">${icone('minus')}</button>
      <b class="num ${acabando ? 'baixo' : ''}">${p.qtd}</b>
      <button class="redondo mais" data-entrada="${p.id}" aria-label="Colocar">${icone('plus')}</button>
    </div>
  </article>`;
}

/* Formulário */

function abrirFormulario(id = null) {
  const p = id ? buscarProduto(id) : null;
  editandoId = p?.id ?? null;
  fotoAtual = p?.foto ?? null;

  $('#tituloForm').textContent = p ? 'Editar produto' : 'Novo produto';
  $('#fNome').value = p?.nome ?? '';
  $('#fMarca').value = p?.marca ?? '';
  $('#fCategoria').value = p?.categoria ?? '';
  $('#fMarca').dataset.nova = '';
  $('#fCategoria').dataset.nova = '';
  $('#fCusto').value = p ? paraCampo(p.custo) : '';
  $('#fPreco').value = p ? paraCampo(p.preco) : '';
  $('#fQtd').value = p?.qtd ?? 0;
  $('#fMinimo').value = p?.minimo ?? 2;
  $('#apagar').hidden = !p;
  mostrarSugestoes();
  mostrarFoto();
  mostrarLucro();
  $('#janelaProduto').showModal();
}

/** Marcas e categorias salvas viram botões: um toque preenche o campo; "+ Nova" abre o campo para escrever. */
function mostrarSugestoes() {
  desenharSugestoes('#sugestoesMarca', '#fMarca', marcas());
  desenharSugestoes('#sugestoesCategoria', '#fCategoria', categorias());
}

function desenharSugestoes(lista, campo, nomes) {
  const valor = $(campo).value;
  const escrevendoNova = $(campo).dataset.nova === 'sim';
  $(lista).innerHTML = chips(nomes.map(nome => ({ valor: nome, rotulo: nome })), nome => nome === valor, 'sugestao') +
    `<button type="button" class="chip nova ${escrevendoNova ? 'ativo' : ''}" data-nova>${icone('plus')}Nova</button>`;
  // O campo de texto só aparece para uma nova (ou quando ainda não há nenhuma salva)
  $(campo).hidden = !(escrevendoNova || !nomes.length || (valor && !nomes.includes(valor)));
}

function escolherSugestao(evento) {
  const campo = $(`#${evento.currentTarget.dataset.campo}`);
  const botao = evento.target.closest('[data-sugestao], [data-nova]');
  if (!botao) return;
  if ('nova' in botao.dataset) {
    campo.dataset.nova = 'sim';
    campo.value = '';
    mostrarSugestoes();
    campo.focus();
    return;
  }
  campo.dataset.nova = '';
  campo.value = botao.dataset.sugestao;
  mostrarSugestoes();
}

function mostrarFoto() {
  $('#areaFoto').innerHTML = fotoAtual ? `<img src="${fotoAtual}" alt="">` : `${icone('image')}<span>Foto</span>`;
}

function mostrarLucro() {
  const custo = numero($('#fCusto').value);
  const preco = numero($('#fPreco').value);
  if (!custo || !preco) return void ($('#conta').innerHTML = `${icone('star')}Lucro —`);
  const lucro = preco - custo;
  $('#conta').innerHTML = `${icone('star')}Lucro <b class="${lucro < 0 ? 'saida' : ''}">${real(lucro)}</b> · ${Math.round((lucro / custo) * 100)}%`;
}

/** Diminui a foto para no máximo 500px, para o banco não pesar. */
function reduzirFoto(arquivo) {
  return new Promise(ok => {
    const imagem = new Image();
    imagem.onload = () => {
      const escala = Math.min(1, LADO_MAXIMO_FOTO / Math.max(imagem.width, imagem.height));
      const tela = document.createElement('canvas');
      tela.width = imagem.width * escala;
      tela.height = imagem.height * escala;
      tela.getContext('2d').drawImage(imagem, 0, 0, tela.width, tela.height);
      URL.revokeObjectURL(imagem.src);
      ok(tela.toDataURL('image/jpeg', 0.8));
    };
    imagem.src = URL.createObjectURL(arquivo);
  });
}

function lerFormulario() {
  return {
    nome: $('#fNome').value.trim(),
    marca: $('#fMarca').value.trim(),
    categoria: $('#fCategoria').value.trim(),
    custo: numero($('#fCusto').value),
    preco: numero($('#fPreco').value),
    qtd: inteiro($('#fQtd').value),
    minimo: inteiro($('#fMinimo').value),
    foto: fotoAtual,
  };
}

function salvarProduto(evento) {
  const produto = lerFormulario();
  // Os campos de marca e categoria podem estar escondidos, então o navegador não avisa sozinho
  const faltando = !produto.marca ? 'a marca' : !produto.categoria ? 'a categoria' : null;
  if (faltando) {
    evento.preventDefault();
    return avisar(`Escolha ${faltando}`);
  }
  lembrarMarcaECategoria(produto);
  if (editandoId) Object.assign(buscarProduto(editandoId), produto);
  else dados.produtos.push({ id: Date.now().toString(36), ...produto });
  // As peças cadastradas (ou acrescentadas na edição) foram compradas: entram no custo
  registrarComprasQueFaltam();
  persistir('Produto salvo');
}

function registrarMovimento(p, tipo, qtd, preco) {
  dados.movimentos.unshift({
    data: Date.now(),
    produtoId: p.id,
    produto: p.nome,
    marca: p.marca,
    categoria: p.categoria,
    tipo,
    qtd,
    preco,
    custo: p.custo,
    ...(p.exemplo && { exemplo: true }),
  });
}

function apagarProduto() {
  const p = buscarProduto(editandoId);
  if (!confirm(`Apagar "${p.nome}"?`)) return;
  dados.produtos = dados.produtos.filter(x => x.id !== editandoId);
  $('#janelaProduto').close();
  persistir('Produto apagado');
}

/* Colocar e tirar do estoque */

function abrirMovimento(id, tipo) {
  const p = buscarProduto(id);
  const entrada = tipo === 'entrada';
  movimento = { id, tipo };
  $('#tituloMov').textContent = entrada ? 'Colocar' : 'Tirar';
  $('#nomeMov').textContent = `${p.nome} · ${p.qtd} no estoque`;
  $('#qtdMov').value = 1;
  $('#qtdMov').max = entrada ? '' : p.qtd;
  $('#confirmarMov').textContent = entrada ? 'Colocar' : 'Vender';
  $('#campoVenda').hidden = entrada;
  $('#precoVenda').value = paraCampo(p.preco);
  mostrarTotalVenda();
  $('#janelaMov').showModal();
}

function mostrarTotalVenda() {
  const total = numero($('#precoVenda').value) * Math.max(1, inteiro($('#qtdMov').value));
  $('#totalVenda').innerHTML = `${icone('star')}Total <b>${real(total)}</b>`;
}

function confirmarMovimento(evento) {
  const p = buscarProduto(movimento.id);
  const quantidade = Math.max(1, inteiro($('#qtdMov').value));
  const entrada = movimento.tipo === 'entrada';
  if (!entrada && quantidade > p.qtd) {
    evento.preventDefault();
    return avisar(`Só tem ${p.qtd}`);
  }
  p.qtd += entrada ? quantidade : -quantidade;
  // Na saída vale o preço que foi vendido de fato
  registrarMovimento(p, movimento.tipo, quantidade, entrada ? p.preco : numero($('#precoVenda').value));
  persistir(entrada ? `+${quantidade}` : `−${quantidade}`);
}

const ajustarQuantidade = passo => {
  $('#qtdMov').value = Math.max(1, inteiro($('#qtdMov').value) + passo);
  mostrarTotalVenda();
};

export function iniciarProdutos() {
  $('#busca').oninput = desenharProdutos;
  $('#filtroMarca').onchange = desenharProdutos;
  $('#chipsCategoria').addEventListener('click', evento => {
    const botao = evento.target.closest('[data-categoria]');
    if (!botao) return;
    filtro.categoria = botao.dataset.categoria;
    desenharProdutos();
  });
  $('#grade').addEventListener('click', evento => {
    const { editar, entrada, saida } = evento.target.closest('button')?.dataset ?? {};
    if (editar) abrirFormulario(editar);
    if (entrada) abrirMovimento(entrada, 'entrada');
    if (saida) abrirMovimento(saida, 'saida');
  });

  $('#novo').onclick = () => abrirFormulario();
  $('#sugestoesMarca').addEventListener('click', escolherSugestao);
  $('#sugestoesCategoria').addEventListener('click', escolherSugestao);
  $('#fMarca').oninput = mostrarSugestoes;
  $('#fCategoria').oninput = mostrarSugestoes;
  $('#fCusto').oninput = mostrarLucro;
  $('#fPreco').oninput = mostrarLucro;
  $('#areaFoto').onclick = () => $('#arquivoFoto').click();
  $('#arquivoFoto').onchange = async evento => {
    const [arquivo] = evento.target.files;
    evento.target.value = '';
    if (!arquivo) return;
    fotoAtual = await reduzirFoto(arquivo);
    mostrarFoto();
  };
  $('#cancelar').onclick = () => $('#janelaProduto').close();
  $('#apagar').onclick = apagarProduto;
  $('#formProduto').onsubmit = salvarProduto;

  $('#menosUm').onclick = () => ajustarQuantidade(-1);
  $('#maisUm').onclick = () => ajustarQuantidade(1);
  $('#cancelarMov').onclick = () => $('#janelaMov').close();
  $('#qtdMov').oninput = mostrarTotalVenda;
  $('#precoVenda').oninput = mostrarTotalVenda;
  $('#formMov').onsubmit = confirmarMovimento;
}
