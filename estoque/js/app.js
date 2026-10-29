// Ponto de entrada: liga as telas, o banco e as cópias.
import { iniciarAtualizacao } from './atualizacao.js';
import { aoSalvar, carregar, salvar } from './banco.js';
import { registrarComprasQueFaltam } from './consultas.js';
import { iniciarCopias } from './copias.js';
import { criarExemplos } from './exemplos.js';
import { trocarIcones } from './icones.js';
import { iniciarTema } from './tema.js';
import { desenharHistorico } from './telas/historico.js';
import { desenharInicio, iniciarInicio } from './telas/inicio.js';
import { desenharListas, iniciarListas } from './telas/listas.js';
import { desenharProdutos, iniciarProdutos } from './telas/produtos.js';
import { desenharValores, iniciarValores } from './telas/valores.js';
import { desenharVendas, iniciarVendas } from './telas/vendas.js';
import { $$, avisar } from './util.js';

function desenharTudo() {
  desenharInicio();
  desenharProdutos();
  desenharVendas();
  desenharValores();
  desenharHistorico();
  desenharListas();
}

function irPara(tela) {
  $$('nav button').forEach(botao => botao.classList.toggle('ativo', botao.dataset.tela === tela));
  $$('.tela').forEach(secao => secao.classList.toggle('ativa', secao.id === tela));
  desenharTudo();
}

async function iniciar() {
  trocarIcones();
  iniciarTema();
  $$('nav button').forEach(botao => { botao.onclick = () => irPara(botao.dataset.tela); });
  iniciarInicio();
  iniciarProdutos();
  iniciarListas();
  iniciarVendas();
  iniciarValores();

  try {
    await carregar(criarExemplos);
    if (registrarComprasQueFaltam()) await salvar();
  } catch {
    avisar('Não consegui abrir o banco de dados');
  }
  aoSalvar(desenharTudo);
  await iniciarCopias();
  iniciarAtualizacao();
  desenharTudo();
}

iniciar();
