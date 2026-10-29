// Aviso de versão nova. A atualização já vem baixada pelo aplicativo; aqui só perguntamos se pode reiniciar.
import { noAplicativo } from './banco.js';
import { icone } from './icones.js';
import { $ } from './util.js';

function mostrarAviso() {
  const aviso = $('#atualizacao');
  aviso.innerHTML = `${icone('refresh')}
    <span class="cresce"><b>Nova versão</b><br><small>Seus dados continuam salvos</small></span>
    <button class="btn principal" id="atualizarAgora">Atualizar</button>
    <button class="fechar" id="depois" aria-label="Depois">${icone('x')}</button>`;
  aviso.hidden = false;
  $('#atualizarAgora').onclick = () => {
    $('#atualizarAgora').textContent = 'Atualizando…';
    window.aplicativo.instalarAtualizacao();
  };
  // "Depois": a versão nova é instalada sozinha quando o aplicativo for fechado
  $('#depois').onclick = () => { aviso.hidden = true; };
}

export async function iniciarAtualizacao() {
  if (!noAplicativo) return;
  $('#versao').textContent = `Versão ${await window.aplicativo.versao()}`;
  window.aplicativo.aoTerAtualizacao(mostrarAviso);
}
