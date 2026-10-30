// Banco de dados local. Cada mudança é gravada na hora; quem quiser saber disso se inscreve com aoSalvar().
// No aplicativo (aplicativo/main.js) os dados vão para um arquivo no computador;
// aberto no navegador, durante o desenvolvimento, ficam no IndexedDB.
export const noAplicativo = 'aplicativo' in window;
const NOME_BANCO = 'adeylma-estoque';
const CHAVE_DADOS = 'dados';
const CHAVE_RASCUNHO = 'adeylma-estoque-v1'; // localStorage da primeira versão

// Marcas que ela já revende; vêm salvas desde o primeiro uso
const MARCAS_INICIAIS = ["D'Luck", 'Del Rayssa', 'La Paola'];

export const dados = { produtos: [], movimentos: [], marcas: [...MARCAS_INICIAIS], categorias: [], contas: [], fiados: [], clientes: [] };

const ouvintes = [];

const conexao = new Promise((ok, erro) => {
  const pedido = indexedDB.open(NOME_BANCO, 1);
  pedido.onupgradeneeded = () => pedido.result.createObjectStore('chaves');
  pedido.onsuccess = () => ok(pedido.result);
  pedido.onerror = () => erro(pedido.error);
});

export async function ler(nome) {
  const db = await conexao;
  return new Promise((ok, erro) => {
    const pedido = db.transaction('chaves').objectStore('chaves').get(nome);
    pedido.onsuccess = () => ok(pedido.result);
    pedido.onerror = () => erro(pedido.error);
  });
}

export async function gravar(nome, valor) {
  const db = await conexao;
  return new Promise((ok, erro) => {
    const transacao = db.transaction('chaves', 'readwrite');
    transacao.objectStore('chaves').put(valor, nome);
    transacao.oncomplete = ok;
    transacao.onerror = () => erro(transacao.error);
  });
}

/** Carrega os dados salvos; na primeira vez de todas, começa com os dados de `criarPrimeiraVez`. */
export async function carregar(criarPrimeiraVez) {
  const salvos = noAplicativo ? await window.aplicativo.lerDados() : await carregarDoNavegador();
  if (salvos) return substituir(salvos);
  substituir(criarPrimeiraVez());
  await salvar();
}

export async function salvar() {
  if (noAplicativo) await window.aplicativo.gravarDados(JSON.stringify(dados));
  else await gravar(CHAVE_DADOS, dados);
  ouvintes.forEach(ouvinte => ouvinte());
}

async function carregarDoNavegador() {
  // Pede ao navegador para nunca apagar estes dados sozinho (ex.: quando o disco enche)
  await navigator.storage?.persist?.();
  return (await ler(CHAVE_DADOS)) ?? lerRascunho();
}

export const aoSalvar = ouvinte => ouvintes.push(ouvinte);

export const ehCopiaValida = copia => Array.isArray(copia?.produtos) && Array.isArray(copia?.movimentos);

export function substituir({ produtos = [], movimentos = [], marcas = MARCAS_INICIAIS, categorias = [], contas = [], fiados = [], clientes = [] }) {
  dados.produtos = produtos;
  dados.movimentos = movimentos;
  dados.marcas = [...marcas];
  dados.categorias = [...categorias];
  dados.contas = contas;
  dados.fiados = fiados;
  dados.clientes = clientes;
}

function lerRascunho() {
  try { return JSON.parse(localStorage.getItem(CHAVE_RASCUNHO)); } catch { return null; }
}
