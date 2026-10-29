// Cópias de segurança numa pasta do computador (de preferência dentro do Google Drive).
// A cada mudança grava estoque-atual.json e uma cópia do dia; guarda os últimos 30 dias.
// No navegador precisa do Chrome ou do Edge (File System Access API); no aplicativo, quem copia é o aplicativo.
import { aoSalvar, dados, ehCopiaValida, gravar, ler, noAplicativo, salvar, substituir } from './banco.js';
import { icone } from './icones.js';
import { $, avisar, dataHora, escapar, hojeISO } from './util.js';

const DIAS_GUARDADOS = 30;
const COPIA_DIARIA = /^estoque-\d{4}-\d\d-\d\d\.json$/;
const navegadorSuporta = 'showDirectoryPicker' in window;

let pasta = null;

const temPermissao = async () => pasta && (await pasta.queryPermission({ mode: 'readwrite' })) === 'granted';

async function escreverArquivo(nome, conteudo) {
  const arquivo = await pasta.getFileHandle(nome, { create: true });
  const escritor = await arquivo.createWritable();
  await escritor.write(conteudo);
  await escritor.close();
}

async function apagarCopiasAntigas() {
  const diarias = [];
  for await (const nome of pasta.keys()) if (COPIA_DIARIA.test(nome)) diarias.push(nome);
  for (const nome of diarias.sort().slice(0, -DIAS_GUARDADOS)) await pasta.removeEntry(nome);
}

async function copiarParaPasta() {
  if (!(await temPermissao())) return mostrarEstado();
  try {
    const conteudo = JSON.stringify(dados);
    await escreverArquivo('estoque-atual.json', conteudo);
    await escreverArquivo(`estoque-${hojeISO()}.json`, conteudo);
    await apagarCopiasAntigas();
    await gravar('ultimaCopia', Date.now());
  } catch {
    avisar('Não consegui copiar para a pasta');
  }
  mostrarEstado();
}

/** No aplicativo, quem copia é o próprio aplicativo; aqui só mostramos como está. */
async function mostrarEstadoNoAplicativo() {
  const { pasta: destino, ultimaCopia, erroCopia } = await window.aplicativo.estadoDasCopias();
  const estado = $('#estadoCopia');
  $('#faixaCopia').hidden = true;
  if (!destino) {
    mostrarFaixa('alert', 'Cópia no Drive desligada · ligar', irParaCopias);
    estado.innerHTML = `${icone('alert')}<small>Cópia no Drive</small><b>Desligada</b>`;
  } else if (erroCopia) {
    mostrarFaixa('alert', 'Não consegui copiar para o Drive', irParaCopias);
    estado.innerHTML = `${icone('alert')}<small>${escapar(destino)}</small><b class="saida">Com problema</b>`;
  } else {
    estado.innerHTML = `${icone('check-circle')}<small>${escapar(destino)}${ultimaCopia ? ' · ' + dataHora(ultimaCopia) : ''}</small><b class="entrada">Ligada</b>`;
  }
}

const irParaCopias = () => document.querySelector('[data-tela="copias"]').click();

async function mostrarEstado() {
  if (noAplicativo) return mostrarEstadoNoAplicativo();
  const faixa = $('#faixaCopia');
  const estado = $('#estadoCopia');
  faixa.hidden = true;

  if (!navegadorSuporta) {
    estado.innerHTML = `${icone('alert')}<small>Cópia automática</small><b>Use Chrome ou Edge</b>`;
  } else if (!pasta) {
    mostrarFaixa('alert', 'Cópia desligada · ligar', irParaCopias);
    estado.innerHTML = `${icone('alert')}<small>Cópia automática</small><b>Desligada</b>`;
  } else if (!(await temPermissao())) {
    mostrarFaixa('refresh', 'Cópia pausada · continuar', pedirPermissao);
    estado.innerHTML = `${icone('refresh')}<small>${escapar(pasta.name)}</small><b>Pausada</b>`;
  } else {
    const ultima = await ler('ultimaCopia');
    estado.innerHTML = `${icone('check-circle')}<small>${escapar(pasta.name)}${ultima ? ' · ' + dataHora(ultima) : ''}</small><b class="entrada">Ligada</b>`;
  }
}

function mostrarFaixa(nomeIcone, texto, acao) {
  const faixa = $('#faixaCopia');
  faixa.innerHTML = `${icone(nomeIcone)}${texto}`;
  faixa.onclick = acao;
  faixa.hidden = false;
}

async function pedirPermissao() {
  if ((await pasta.requestPermission({ mode: 'readwrite' })) === 'granted') copiarParaPasta();
}

async function escolherPasta() {
  if (noAplicativo) {
    await window.aplicativo.escolherPastaDasCopias();
    return mostrarEstado();
  }
  if (!navegadorSuporta) return;
  try {
    pasta = await showDirectoryPicker({ id: 'copias-estoque', mode: 'readwrite' });
  } catch {
    return; // cancelou
  }
  await gravar('pasta', pasta);
  await copiarParaPasta();
  avisar('Cópia automática ligada');
}

function baixarCopia() {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([JSON.stringify(dados)], { type: 'application/json' }));
  link.download = `estoque-${hojeISO()}.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

async function restaurarCopia(arquivo) {
  let copia = null;
  try { copia = JSON.parse(await arquivo.text()); } catch { /* arquivo inválido */ }
  if (!ehCopiaValida(copia)) return avisar('Esse arquivo não é uma cópia do estoque');
  if (!confirm(`Voltar a cópia com ${copia.produtos.length} produtos? Os dados atuais serão trocados.`)) return;
  substituir(copia);
  await salvar();
  avisar('Cópia restaurada');
}

export async function iniciarCopias() {
  if (noAplicativo) {
    aoSalvar(mostrarEstado);
  } else {
    pasta = (await ler('pasta')) ?? null;
    aoSalvar(copiarParaPasta);
  }

  $('#escolherPasta').onclick = escolherPasta;
  $('#baixarCopia').onclick = baixarCopia;
  $('#restaurarCopia').onclick = () => $('#arquivoCopia').click();
  $('#arquivoCopia').onchange = evento => {
    const [arquivo] = evento.target.files;
    evento.target.value = '';
    if (arquivo) restaurarCopia(arquivo);
  };
  mostrarEstado();
}
