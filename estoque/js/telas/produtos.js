import { dados, salvar } from '../banco.js';
import { chips, vazio } from '../componentes.js';
import { buscarProduto, categorias, estaAcabando, lembrarMarcaECategoria, marcas, registrarComprasQueFaltam } from '../consultas.js';
import { garantirCliente } from '../clientes.js';
import { registrarFiado } from '../financeiro.js';
import { icone } from '../icones.js';
import { ilustracao } from '../ilustracoes.js';
import { $, avisar, escapar, inteiro, numero, paraCampo, real } from '../util.js';

const TODAS = '';
const LADO_MAXIMO_FOTO = 500;
export const TAMANHOS = ['P', 'M', 'G'];

const filtro = { categoria: TODAS };
let editandoId = null;
let fotoAtual = null;
let movimento = null; // { id, tipo: 'entrada' | 'saida', tamanho }

async function persistir(mensagem) {
  try {
    await salvar();
    avisar(mensagem);
  } catch {
    avisar('Não consegui salvar!');
  }
}

const textoTamanhos = tamanhos => TAMANHOS.map(t => `${t} ${tamanhos[t] ?? 0}`).join(' · ');

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
    (!busca || `${p.nome} ${p.marca} ${p.ref ?? ''}`.toLowerCase().includes(busca)));

  if (!dados.produtos.length) return void ($('#grade').innerHTML = vazio('grid', 'Nenhum produto'));
  if (!visiveis.length) return void ($('#grade').innerHTML = vazio('search', 'Nada encontrado'));
  $('#grade').innerHTML = visiveis.map(cartao).join('');
}

function cartao(p) {
  const acabando = estaAcabando(p);
  return `<article class="card ${p.qtd === 0 ? 'esgotado' : acabando ? 'acabando' : ''}">
    <div class="foto">
      ${p.foto ? `<img src="${p.foto}" alt="">` : ilustracao(p.categoria)}
      <button class="editar" data-editar="${p.id}" aria-label="Editar">${icone('edit')}</button>
      ${acabando ? `<span class="selo" title="Acabando">${icone('alert')}</span>` : ''}
    </div>
    <div class="info">
      <div class="nome">${escapar(p.nome)}</div>
      <small>${escapar(p.marca)}${p.ref ? ` · REF ${escapar(p.ref)}` : ''}</small>
      ${p.preco ? `<small class="preco">Último preço ${real(p.preco)}</small>` : ''}
      ${p.tamanhos ? `<small class="tamanhos">${textoTamanhos(p.tamanhos)}</small>` : ''}
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
  $('#fRef').value = p?.ref ?? '';
  $('#fQtd').value = p?.qtd ?? 0;
  $('#fMinimo').value = p?.minimo ?? 2;
  TAMANHOS.forEach(t => { $(`#fTam${t}`).value = p?.tamanhos?.[t] ?? 0; });
  mostrarModoTamanhos(Boolean(p?.tamanhos));
  $('#apagar').hidden = !p;
  mostrarSugestoes();
  mostrarFoto();
  $('#janelaProduto').showModal();
}

/** Com tamanhos, a quantidade é a soma de P, M e G; sem, é um número só. */
function mostrarModoTamanhos(comTamanhos) {
  $('#fTemTamanhos').classList.toggle('ativo', comTamanhos);
  $('#fSemTamanhos').classList.toggle('ativo', !comTamanhos);
  $('#campoTamanhos').hidden = !comTamanhos;
  $('#campoQtd').hidden = comTamanhos;
}

const comTamanhos = () => $('#fTemTamanhos').classList.contains('ativo');

/** Marcas e categorias salvas viram botões: um toque preenche o campo; "+ Nova" abre o campo para escrever. */
function mostrarSugestoes() {
  desenharSugestoes('#sugestoesMarca', '#fMarca', marcas());
  desenharSugestoes('#sugestoesCategoria', '#fCategoria', categorias());
  mostrarFoto(); // o desenho padrão acompanha a categoria
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

/** Sem foto, mostra o desenho padrão da categoria escolhida. */
function mostrarFoto() {
  $('#areaFoto').innerHTML = fotoAtual
    ? `<img src="${fotoAtual}" alt="">`
    : `${ilustracao($('#fCategoria').value)}<span>${icone('image')}Colocar foto</span>`;
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
  const tamanhos = comTamanhos() ? Object.fromEntries(TAMANHOS.map(t => [t, inteiro($(`#fTam${t}`).value)])) : null;
  return {
    nome: $('#fNome').value.trim(),
    ref: $('#fRef').value.trim(),
    marca: $('#fMarca').value.trim(),
    categoria: $('#fCategoria').value.trim(),
    custo: numero($('#fCusto').value),
    tamanhos,
    qtd: tamanhos ? Object.values(tamanhos).reduce((a, b) => a + b, 0) : inteiro($('#fQtd').value),
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
  else dados.produtos.push({ id: Date.now().toString(36), preco: null, ...produto });
  // As peças cadastradas (ou acrescentadas na edição) foram compradas: entram no custo
  registrarComprasQueFaltam();
  persistir('Produto salvo');
}

// O nome fica igual ao do cadastro (mesmas maiúsculas), para a ficha da cliente achar a compra
const garantirNome = nome => (nome ? garantirCliente(nome).nome : '');

function registrarMovimento(p, tipo, qtd, preco, tamanho, cliente) {
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
    ...(tamanho && { tamanho }),
    ...(cliente && { cliente }),
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
  movimento = { id, tipo, tamanho: null };
  $('#tituloMov').textContent = entrada ? 'Colocar' : 'Tirar';
  $('#nomeMov').textContent = `${p.nome} · ${p.qtd} no estoque`;
  $('#qtdMov').value = 1;
  $('#confirmarMov').textContent = entrada ? 'Colocar' : 'Vender';
  $('#campoVenda').hidden = entrada;
  $('#precoVenda').value = p.preco ? paraCampo(p.preco) : '';
  $('#vendaFiado').checked = false;
  $('#clienteVenda').value = '';
  desenharTamanhosDoMovimento(p);
  mostrarTotalVenda();
  $('#janelaMov').showModal();
}

/** Produto com tamanhos: ela escolhe P, M ou G antes de vender ou colocar. */
function desenharTamanhosDoMovimento(p) {
  $('#tamanhosMov').hidden = !p.tamanhos;
  if (!p.tamanhos) return;
  $('#tamanhosMov').innerHTML = TAMANHOS.map(t =>
    `<button type="button" class="chip ${movimento.tamanho === t ? 'ativo' : ''}" data-tamanho="${t}">${t} <small>(${p.tamanhos[t] ?? 0})</small></button>`).join('');
}

function mostrarTotalVenda() {
  const total = numero($('#precoVenda').value) * Math.max(1, inteiro($('#qtdMov').value));
  $('#totalVenda').innerHTML = `${icone('star')}Total <b>${real(total)}</b>`;
}

function confirmarMovimento(evento) {
  const p = buscarProduto(movimento.id);
  const quantidade = Math.max(1, inteiro($('#qtdMov').value));
  const entrada = movimento.tipo === 'entrada';
  const { tamanho } = movimento;
  const falha = mensagem => { evento.preventDefault(); avisar(mensagem); };

  if (p.tamanhos && !tamanho) return falha('Escolha o tamanho');
  const disponivel = tamanho ? (p.tamanhos[tamanho] ?? 0) : p.qtd;
  if (!entrada && quantidade > disponivel) return falha(`Só tem ${disponivel}${tamanho ? ` no ${tamanho}` : ''}`);
  const precoVendido = numero($('#precoVenda').value);
  if (!entrada && !precoVendido) return falha('Escreva por quanto vendeu');
  const fiado = !entrada && $('#vendaFiado').checked;
  const cliente = entrada ? '' : $('#clienteVenda').value.trim();
  if (fiado && !cliente) return falha('Escreva o nome da cliente');

  const sinal = entrada ? 1 : -1;
  p.qtd += sinal * quantidade;
  if (tamanho) p.tamanhos[tamanho] = disponivel + sinal * quantidade;
  // Na saída vale o preço que foi vendido de fato, que fica de sugestão para a próxima venda
  const preco = entrada ? p.preco : precoVendido;
  if (!entrada) p.preco = precoVendido;
  registrarMovimento(p, movimento.tipo, quantidade, preco, tamanho, garantirNome(cliente));
  if (fiado) registrarFiado({ cliente: garantirNome(cliente), descricao: `${quantidade}× ${p.nome}${tamanho ? ` (${tamanho})` : ''}`, valor: quantidade * preco });
  persistir(fiado ? `Fiado para ${cliente}` : entrada ? `+${quantidade}` : `−${quantidade}`);
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
  $('#fSemTamanhos').onclick = () => mostrarModoTamanhos(false);
  $('#fTemTamanhos').onclick = () => mostrarModoTamanhos(true);
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

  $('#tamanhosMov').addEventListener('click', evento => {
    const botao = evento.target.closest('[data-tamanho]');
    if (!botao) return;
    movimento.tamanho = botao.dataset.tamanho;
    desenharTamanhosDoMovimento(buscarProduto(movimento.id));
  });
  $('#vendaFiado').onchange = () => {
    if ($('#vendaFiado').checked && !$('#clienteVenda').value) $('#clienteVenda').focus();
  };
  $('#menosUm').onclick = () => ajustarQuantidade(-1);
  $('#maisUm').onclick = () => ajustarQuantidade(1);
  $('#cancelarMov').onclick = () => $('#janelaMov').close();
  $('#qtdMov').oninput = mostrarTotalVenda;
  $('#precoVenda').oninput = mostrarTotalVenda;
  $('#formMov').onsubmit = confirmarMovimento;
}
