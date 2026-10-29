// Janela "Marcas e categorias": adicionar e remover os nomes salvos.
import { salvar } from '../banco.js';
import { adicionarNaLista, categorias, marcas, quantosUsam, removerDaLista } from '../consultas.js';
import { icone } from '../icones.js';
import { $, avisar, escapar } from '../util.js';

const NOMES = { marca: { lista: marcas, titulo: 'marca' }, categoria: { lista: categorias, titulo: 'categoria' } };

function desenharLista(campo) {
  const nomes = NOMES[campo].lista();
  $(`#lista-${campo}`).innerHTML = nomes.length
    ? nomes.map(nome => {
      const usos = quantosUsam(campo, nome);
      return `<div class="linha">
        <span class="cresce">${escapar(nome)}<br><small>${usos ? `${usos} produto${usos > 1 ? 's' : ''}` : 'Sem produtos'}</small></span>
        <button type="button" class="fechar" data-remover="${escapar(nome)}" data-campo="${campo}" aria-label="Remover ${escapar(nome)}">${icone('trash')}</button>
      </div>`;
    }).join('')
    : '<p class="nada">—</p>';
}

export function desenharListas() {
  desenharLista('marca');
  desenharLista('categoria');
}

async function adicionar(campo) {
  const entrada = $(`#nova-${campo}`);
  const nome = entrada.value.trim();
  if (!nome) return entrada.focus();
  if (!adicionarNaLista(campo, nome)) return avisar(`Essa ${NOMES[campo].titulo} já existe`);
  entrada.value = '';
  await salvar();
  avisar(`${nome} adicionada`);
}

async function remover(campo, nome) {
  const usos = quantosUsam(campo, nome);
  if (usos) return avisar(`${nome} está em ${usos} produto${usos > 1 ? 's' : ''}. Troque antes de remover.`);
  if (!confirm(`Remover "${nome}"?`)) return;
  removerDaLista(campo, nome);
  await salvar();
  avisar(`${nome} removida`);
}

export function iniciarListas() {
  $('#abrirListas').onclick = () => {
    desenharListas();
    $('#janelaListas').showModal();
  };
  $('#fecharListas').onclick = () => $('#janelaListas').close();
  ['marca', 'categoria'].forEach(campo => {
    $(`#adicionar-${campo}`).onclick = () => adicionar(campo);
    $(`#nova-${campo}`).onkeydown = evento => {
      if (evento.key !== 'Enter') return;
      evento.preventDefault();
      adicionar(campo);
    };
  });
  $('#janelaListas').addEventListener('click', evento => {
    const botao = evento.target.closest('[data-remover]');
    if (botao) remover(botao.dataset.campo, botao.dataset.remover);
  });
}
