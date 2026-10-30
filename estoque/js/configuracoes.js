// Aba Configurações: tamanho de tudo (zoom), tela cheia e tema.
// Ficam guardados neste computador (localStorage), não nos dados do estoque.
// O index.html aplica o tamanho salvo antes de desenhar, para a tela não pular.
import { noAplicativo } from './banco.js';
import { chips } from './componentes.js';
import { $ } from './util.js';

const CHAVE_TAMANHO = 'tamanho';
// Compacto é o padrão: fica bem numa tela de notebook
export const TAMANHO_PADRAO = '0.9';
const TAMANHOS = [
  { valor: '0.8', rotulo: 'Pequeno' },
  { valor: '0.9', rotulo: 'Compacto' },
  { valor: '1', rotulo: 'Normal' },
  { valor: '1.1', rotulo: 'Grande' },
];

const lerTamanho = () => {
  try { return localStorage.getItem(CHAVE_TAMANHO) ?? TAMANHO_PADRAO; } catch { return TAMANHO_PADRAO; }
};

function aplicarTamanho(valor) {
  document.documentElement.style.zoom = valor;
  try { localStorage.setItem(CHAVE_TAMANHO, valor); } catch { /* fica só nesta sessão */ }
  desenharConfiguracoes();
}

const emTelaCheia = async () => (noAplicativo ? window.aplicativo.estaEmTelaCheia() : Boolean(document.fullscreenElement));

async function alternarTelaCheia() {
  const ligar = !(await emTelaCheia());
  if (noAplicativo) await window.aplicativo.telaCheia(ligar);
  else if (ligar) await document.documentElement.requestFullscreen();
  else await document.exitFullscreen();
  desenharConfiguracoes();
}

export async function desenharConfiguracoes() {
  $('#escolhaTamanho').innerHTML = chips(TAMANHOS, valor => valor === lerTamanho(), 'tamanho-tela');
  const cheia = await emTelaCheia();
  $('#alternarTelaCheia').classList.toggle('ativo', cheia);
  $('#alternarTelaCheia').querySelector('span').textContent = cheia ? 'Ligada' : 'Desligada';
}

export function iniciarConfiguracoes() {
  $('#escolhaTamanho').addEventListener('click', evento => {
    const botao = evento.target.closest('[data-tamanho-tela]');
    if (botao) aplicarTamanho(botao.dataset.tamanhoTela);
  });
  $('#alternarTelaCheia').onclick = alternarTelaCheia;
  document.addEventListener('fullscreenchange', desenharConfiguracoes);
  // F11 também liga e desliga a tela cheia
  document.addEventListener('keydown', evento => {
    if (evento.key !== 'F11') return;
    evento.preventDefault();
    alternarTelaCheia();
  });
}
