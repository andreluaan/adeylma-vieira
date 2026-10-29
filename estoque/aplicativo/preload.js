// Ponte segura entre a tela e o computador: a tela só enxerga estas funções.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('aplicativo', {
  lerDados: () => ipcRenderer.invoke('dados:ler'),
  gravarDados: conteudo => ipcRenderer.invoke('dados:gravar', conteudo),
  estadoDasCopias: () => ipcRenderer.invoke('copias:estado'),
  escolherPastaDasCopias: () => ipcRenderer.invoke('copias:escolherPasta'),
  versao: () => ipcRenderer.invoke('aplicativo:versao'),
  aoTerAtualizacao: avisar => ipcRenderer.on('atualizacao:pronta', (_evento, versao) => avisar(versao)),
  instalarAtualizacao: () => ipcRenderer.invoke('atualizacao:instalar'),
});
