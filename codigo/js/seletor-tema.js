const opcoesDeTema = document.querySelectorAll("[data-opcao-tema]");

function aplicarTema(tema) {
  document.documentElement.dataset.tema = tema;

  opcoesDeTema.forEach(opcao => {
    opcao.setAttribute("aria-pressed", String(opcao.dataset.opcaoTema === tema));
  });

  try {
    localStorage.setItem("tema", tema);
  } catch {
    // Sem armazenamento (aba anônima), o tema vale só para esta visita.
  }
}

opcoesDeTema.forEach(opcao => {
  opcao.addEventListener("click", () => aplicarTema(opcao.dataset.opcaoTema));
});

aplicarTema(document.documentElement.dataset.tema);
