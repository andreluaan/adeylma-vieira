const TEMPO_DO_AVISO_MS = 1600;

function mostrarAviso(botao, mensagem) {
  const textoOriginal = botao.dataset.textoOriginal ?? botao.textContent;
  botao.dataset.textoOriginal = textoOriginal;
  botao.textContent = mensagem;
  setTimeout(() => (botao.textContent = textoOriginal), TEMPO_DO_AVISO_MS);
}

function selecionarTexto(elemento) {
  const intervalo = document.createRange();
  intervalo.selectNodeContents(elemento);
  getSelection().removeAllRanges();
  getSelection().addRange(intervalo);
}

async function copiarTexto(botao) {
  const elemento = document.getElementById(botao.dataset.copiar);

  try {
    await navigator.clipboard.writeText(elemento.innerText);
    mostrarAviso(botao, "Copiado");
  } catch {
    selecionarTexto(elemento);
    mostrarAviso(botao, "Selecionado");
  }
}

document.querySelectorAll("[data-copiar]").forEach(botao => {
  botao.addEventListener("click", () => copiarTexto(botao));
});
