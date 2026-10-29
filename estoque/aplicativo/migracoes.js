// Versões do formato dos dados.
// Quando o formato mudar: suba VERSAO_ATUAL e escreva a migração da versão anterior para a nova.
// Ao abrir, o aplicativo aplica em ordem só as migrações que faltam, guardando antes uma cópia.
//
// Exemplo:
//   2: dados => { dados.produtos.forEach(p => { if (p.preco === 0) p.preco = null; }); },

const VERSAO_ATUAL = 1;

const MIGRACOES = {};

/** Arquivos sem número de versão são da versão 1. */
const versaoDe = dados => dados.versao ?? 1;

const precisaMigrar = dados => versaoDe(dados) < VERSAO_ATUAL;

function migrar(dados) {
  for (let versao = versaoDe(dados) + 1; versao <= VERSAO_ATUAL; versao++) {
    MIGRACOES[versao]?.(dados);
    dados.versao = versao;
  }
  return dados;
}

module.exports = { VERSAO_ATUAL, precisaMigrar, migrar, versaoDe };
