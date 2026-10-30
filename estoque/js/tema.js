// Tema claro/escuro. Sem escolha salva, segue o do computador.
// O index.html aplica o tema salvo antes de desenhar, para a tela não piscar.
import { icone } from './icones.js';
import { $ } from './util.js';

const CHAVE = 'tema';
const raiz = document.documentElement;

const temaAtual = () => raiz.dataset.theme ?? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

function mostrarBotao() {
  const escuro = temaAtual() === 'dark';
  $('#trocarTema').innerHTML = `${icone(escuro ? 'sun' : 'moon')}<span>${escuro ? 'Claro' : 'Escuro'}</span>`;
  $('#temaAjustes').textContent = escuro ? 'Escuro' : 'Claro';
}

function trocarTema() {
  raiz.dataset.theme = temaAtual() === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem(CHAVE, raiz.dataset.theme); } catch { /* fica só nesta sessão */ }
  mostrarBotao();
}

export function iniciarTema() {
  $('#trocarTema').onclick = trocarTema;
  $('#temaAjustes').onclick = trocarTema;
  mostrarBotao();
}
