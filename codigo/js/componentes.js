const ICONE_WHATSAPP = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
    <path d="M4 20l1.3-3.8A8 8 0 1 1 8 19z"/>
    <path d="M9 9.5c.3 2.3 2.2 4.2 4.5 4.5l1-1.2 2 1-.5 1.7c-3.6.2-7.7-3.8-7.5-7.5l1.7-.5 1 2z" fill="currentColor" stroke="none"/>
  </svg>`;

const ICONE_INSTAGRAM = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
    <rect x="4" y="4" width="16" height="16" rx="4.5"/>
    <circle cx="12" cy="12" r="3.6"/>
    <circle cx="16.6" cy="7.4" r=".9" fill="currentColor" stroke="none"/>
  </svg>`;

function escaparHtml(texto) {
  return texto.replace(/&/g, "&amp;").replace(/</g, "&lt;");
}

function cartaoFrente() {
  return `
    <div class="cartao cartao--frente">
      <div class="cartao__logo">
        <div class="cartao__nome brilho">Adeylma <em>Vieira</em></div>
        <div class="cartao__slogan">${escaparHtml(MARCA.slogan)}</div>
      </div>
    </div>`;
}

function cartaoVerso() {
  const [primeiraMarca, segundaMarca, terceiraMarca] = MARCA.marcasRevendidas;

  return `
    <div class="cartao cartao--verso">
      <div class="cartao__lateral brilho">Adeylma</div>
      <div class="cartao__dados">
        <div>
          <div class="cartao__titular">${MARCA.nome}</div>
          <div class="cartao__funcao">Revendedora</div>
        </div>
        <div class="cartao__marcas">${primeiraMarca} · ${segundaMarca}<br>${terceiraMarca}</div>
        <div class="cartao__contatos">
          <div class="cartao__contato">${ICONE_WHATSAPP}${MARCA.whatsapp}</div>
          <div class="cartao__contato">${ICONE_INSTAGRAM}@${MARCA.instagram}</div>
        </div>
      </div>
    </div>`;
}

function destaqueInstagram({ capa, nome }) {
  return `
    <figure class="destaque">
      <div class="destaque__capa">${capa}</div>
      <figcaption class="destaque__nome">${nome}</figcaption>
    </figure>`;
}

function postInstagram({ tipo, titulo, legenda }) {
  if (tipo === "foto") {
    return `<div class="post post--foto"><span class="post__aviso">foto da peça</span></div>`;
  }

  return `
    <div class="post post--${tipo}">
      <div>
        <div class="post__titulo">${titulo}</div>
        <div class="post__legenda">${legenda}</div>
      </div>
    </div>`;
}

function perfilInstagram() {
  const linhasDaBio = TEXTOS_PRONTOS.bio
    .split("\n")
    .map(linha => `<span>${escaparHtml(linha)}</span>`)
    .join("");

  return `
    <div class="perfil">
      <div class="perfil__topo">
        <div class="perfil__foto">
          <div class="monograma"><span class="monograma__letras">A<i>V</i></span></div>
        </div>
        <div class="perfil__identificacao">
          <div class="perfil__usuario">${MARCA.instagram}</div>
          <div class="perfil__numeros">Posts · Seguidores · Seguindo</div>
        </div>
      </div>
      <div class="perfil__bio">
        <span class="perfil__nome">${MARCA.nome} | ${escaparHtml(MARCA.slogan)}</span>
        <span class="perfil__categoria">Loja de roupas</span>
        ${linhasDaBio}
        <a class="perfil__link" href="${MARCA.linkWhatsapp}">${MARCA.linkWhatsapp.replace("https://", "")}</a>
      </div>
      <div class="perfil__destaques">${DESTAQUES_INSTAGRAM.map(destaqueInstagram).join("")}</div>
      <div class="perfil__feed">${POSTS_INSTAGRAM.map(postInstagram).join("")}</div>
    </div>`;
}

const COMPONENTES = {
  "cartao-frente": cartaoFrente,
  "cartao-verso": cartaoVerso,
  "perfil-instagram": perfilInstagram,
};

function montarComponentes() {
  document.querySelectorAll("[data-componente]").forEach(elemento => {
    elemento.innerHTML = COMPONENTES[elemento.dataset.componente]();
  });

  document.querySelectorAll("[data-texto-pronto]").forEach(elemento => {
    elemento.innerHTML = escaparHtml(TEXTOS_PRONTOS[elemento.dataset.textoPronto]);
  });
}

montarComponentes();
