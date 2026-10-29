// Aplicativo de computador: abre o estoque numa janela própria e guarda os dados em arquivo.
//
// Onde ficam os dados (pasta do usuário, %APPDATA%\Estoque Adeylma):
//   estoque.json           → o banco de dados
//   estoque.anterior.json  → a versão antes da última gravação
//   copias\                → uma cópia por dia, últimos 30 dias
// E, se houver Google Drive no computador, uma cópia em "Meu Drive\Estoque Adeylma".
const { app, BrowserWindow, dialog, ipcMain, protocol, net } = require('electron');
const { autoUpdater } = require('electron-updater');
const fs = require('node:fs/promises');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { VERSAO_ATUAL, migrar, precisaMigrar, versaoDe } = require('./migracoes');

const PASTA_DADOS = app.getPath('userData');
const ARQUIVO_DADOS = path.join(PASTA_DADOS, 'estoque.json');
const ARQUIVO_ANTERIOR = path.join(PASTA_DADOS, 'estoque.anterior.json');
const ARQUIVO_CONFIG = path.join(PASTA_DADOS, 'config.json');
const PASTA_COPIAS_LOCAIS = path.join(PASTA_DADOS, 'copias');
const PASTA_SITE = path.join(__dirname, '..');
const DIAS_GUARDADOS = 30;
const COPIA_DIARIA = /^estoque-\d{4}-\d\d-\d\d\.json$/;
const PASTAS_DRIVE = ['G:\\Meu Drive', 'G:\\My Drive', path.join(app.getPath('home'), 'Google Drive', 'Meu Drive')];

const hojeISO = () => new Date().toISOString().slice(0, 10);

const existe = caminho => fs.access(caminho).then(() => true, () => false);

async function lerJSON(caminho) {
  try { return JSON.parse(await fs.readFile(caminho, 'utf8')); } catch { return null; }
}

/** Grava num arquivo temporário e só depois troca: se o PC desligar no meio, o arquivo antigo continua inteiro. */
async function gravarSeguro(caminho, conteudo) {
  const temporario = `${caminho}.tmp`;
  await fs.writeFile(temporario, conteudo, 'utf8');
  await fs.rename(temporario, caminho);
}

async function lerConfig() {
  return (await lerJSON(ARQUIVO_CONFIG)) ?? {};
}

async function salvarConfig(config) {
  await gravarSeguro(ARQUIVO_CONFIG, JSON.stringify(config, null, 2));
}

/** Na primeira vez, usa sozinho o Google Drive do computador, se existir. */
async function pastaDasCopias() {
  const config = await lerConfig();
  if (config.pastaCopias) return config.pastaCopias;
  for (const drive of PASTAS_DRIVE) {
    if (await existe(drive)) {
      config.pastaCopias = path.join(drive, 'Estoque Adeylma');
      await salvarConfig(config);
      return config.pastaCopias;
    }
  }
  return null;
}

async function copiarPara(pasta, conteudo) {
  await fs.mkdir(pasta, { recursive: true });
  await gravarSeguro(path.join(pasta, 'estoque-atual.json'), conteudo);
  await gravarSeguro(path.join(pasta, `estoque-${hojeISO()}.json`), conteudo);
  const diarias = (await fs.readdir(pasta)).filter(nome => COPIA_DIARIA.test(nome)).sort();
  for (const nome of diarias.slice(0, -DIAS_GUARDADOS)) await fs.unlink(path.join(pasta, nome));
}

async function fazerCopias(conteudo) {
  await copiarPara(PASTA_COPIAS_LOCAIS, conteudo);
  const pasta = await pastaDasCopias();
  if (!pasta) return;
  try {
    await copiarPara(pasta, conteudo);
    await salvarConfig({ ...(await lerConfig()), ultimaCopia: Date.now(), erroCopia: null });
  } catch (erro) {
    await salvarConfig({ ...(await lerConfig()), erroCopia: erro.message });
  }
}

async function estadoDasCopias() {
  const { ultimaCopia = null, erroCopia = null } = await lerConfig();
  return { pasta: await pastaDasCopias(), ultimaCopia, erroCopia };
}

/* Conversa com a tela (ver preload.js) */

/** Lê os dados e, se vieram de uma versão antiga do aplicativo, atualiza o formato (com cópia antes). */
async function lerDados() {
  const dados = await lerJSON(ARQUIVO_DADOS);
  if (!dados || !precisaMigrar(dados)) return dados;
  await fs.copyFile(ARQUIVO_DADOS, path.join(PASTA_DADOS, `estoque.antes-da-v${VERSAO_ATUAL}-de-v${versaoDe(dados)}.json`));
  const migrados = migrar(dados);
  await gravarSeguro(ARQUIVO_DADOS, JSON.stringify(migrados));
  return migrados;
}

ipcMain.handle('dados:ler', lerDados);

ipcMain.handle('dados:gravar', async (_evento, conteudo) => {
  const dados = JSON.parse(conteudo); // nunca grava algo quebrado
  const comVersao = JSON.stringify({ ...dados, versao: VERSAO_ATUAL });
  if (await existe(ARQUIVO_DADOS)) await fs.copyFile(ARQUIVO_DADOS, ARQUIVO_ANTERIOR);
  await gravarSeguro(ARQUIVO_DADOS, comVersao);
  await fazerCopias(comVersao);
});

/* Atualização automática: baixa em segundo plano pelo GitHub (andreluaan/adeylma-vieira, ver package.json)
   e avisa a tela. Se ela não clicar em "Atualizar", instala sozinho quando o aplicativo for fechado. */

function procurarAtualizacao(janela) {
  if (!app.isPackaged) return;
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.on('update-downloaded', ({ version }) => janela.webContents.send('atualizacao:pronta', version));
  autoUpdater.on('error', () => { /* sem internet ou sem versão nova: tenta de novo na próxima vez */ });
  autoUpdater.checkForUpdates().catch(() => {});
}

ipcMain.handle('atualizacao:instalar', () => autoUpdater.quitAndInstall(true, true));
ipcMain.handle('aplicativo:versao', () => app.getVersion());

ipcMain.handle('copias:estado', estadoDasCopias);

ipcMain.handle('copias:escolherPasta', async evento => {
  const { canceled, filePaths } = await dialog.showOpenDialog(BrowserWindow.fromWebContents(evento.sender), {
    title: 'Pasta das cópias',
    properties: ['openDirectory', 'createDirectory'],
  });
  if (canceled) return estadoDasCopias();
  await salvarConfig({ ...(await lerConfig()), pastaCopias: filePaths[0] });
  const atual = await fs.readFile(ARQUIVO_DADOS, 'utf8').catch(() => null);
  if (atual) await fazerCopias(atual);
  return estadoDasCopias();
});

/* Janela */

// Os arquivos do site são servidos por app://estoque/ (os módulos JS não carregam direto de file://)
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true } }]);

function servirSite() {
  protocol.handle('app', pedido => {
    const relativo = decodeURIComponent(new URL(pedido.url).pathname).replace(/^\/+/, '') || 'index.html';
    const caminho = path.normalize(path.join(PASTA_SITE, relativo));
    if (!caminho.startsWith(PASTA_SITE)) return new Response('', { status: 403 });
    return net.fetch(pathToFileURL(caminho).toString());
  });
}

function abrirJanela() {
  const janela = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 380,
    title: 'Estoque Adeylma',
    backgroundColor: '#faf7f2',
    autoHideMenuBar: true,
    show: false,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, sandbox: true },
  });
  janela.removeMenu();
  janela.once('ready-to-show', () => { janela.maximize(); janela.show(); });
  janela.loadURL('app://estoque/index.html');
  return janela;
}

// Só uma janela aberta por vez: clicar no atalho de novo traz a que já existe
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  let janela = null;
  app.on('second-instance', () => {
    if (!janela) return;
    if (janela.isMinimized()) janela.restore();
    janela.focus();
  });
  app.whenReady().then(() => {
    servirSite();
    janela = abrirJanela();
    janela.webContents.once('did-finish-load', () => procurarAtualizacao(janela));
  });
  app.on('window-all-closed', () => app.quit());
}
