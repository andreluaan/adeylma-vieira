// Ponto de entrada: liga as telas, o banco e as cópias.
import { iniciarAtualizacao } from './atualizacao.js';
import { aoSalvar, carregar, salvar } from './banco.js';
import { registrarComprasQueFaltam } from './consultas.js';
import { desenharConfiguracoes, iniciarConfiguracoes } from './configuracoes.js';
import { iniciarCopias } from './copias.js';
import { criarExemplos } from './exemplos.js';
import { trocarIcones } from './icones.js';
import { iniciarTema } from './tema.js';
import { cadastrarClientesCitadas } from './clientes.js';
import { desenharClientes, iniciarClientes } from './telas/clientes.js';
import { desenharFinanceiro, iniciarFinanceiro } from './telas/financeiro.js';
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
  desenharClientes();
  desenharFinanceiro();
  desenharConfiguracoes();
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
  iniciarClientes();
  iniciarFinanceiro();
  iniciarConfiguracoes();

  try {
    await carregar(criarExemplos);
    // Ajustes em dados de versões anteriores: compras que faltam e clientes citadas sem cadastro
    const comprasNovas = registrarComprasQueFaltam();
    if (cadastrarClientesCitadas() || comprasNovas) await salvar();
  } catch {
    avisar('Não consegui abrir o banco de dados');
  }
  aoSalvar(desenharTudo);
  await iniciarCopias();
  iniciarAtualizacao();
  desenharTudo();
}

iniciar();
