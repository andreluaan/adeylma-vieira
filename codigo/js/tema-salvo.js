const TEMAS = ["preto", "bege"];

function lerTemaSalvo() {
  const temaDoLink = location.hash.slice(1);
  if (TEMAS.includes(temaDoLink)) return temaDoLink;

  try {
    return localStorage.getItem("tema");
  } catch {
    return null;
  }
}

const temaSalvo = lerTemaSalvo();
if (TEMAS.includes(temaSalvo)) {
  document.documentElement.dataset.tema = temaSalvo;
}
