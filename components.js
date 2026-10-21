const MARCA = {
  nome: "Adeylma Vieira",
  whatsapp: "(83) 99694-3038",
  waLink: "https://wa.me/5583996943038",
  instagram: "adeylmavieira",
};

const TEXTOS = {
  bio: `Revendedora D'Luck · Del Rayssa · La Paola
Moda feminina, lingerie, praia e fitness
Pedidos e catálogo pelo WhatsApp`,

  cartao: `*ADEYLMA VIEIRA*
_Moda & Lingerie_

Revendedora das marcas:
- *D'Luck* - moda feminina
- *Del Rayssa Lingerie* - moda íntima
- *La Paola Lingerie* - lingerie, praia, fitness e camisetaria

Pronta entrega e encomendas
Pagamento: Pix, cartão e dinheiro

WhatsApp: ${MARCA.whatsapp}
Instagram: @${MARCA.instagram}

Me chama que eu te mando o catálogo!`,

  formulario: `*PEDIDO - ADEYLMA VIEIRA*

Copie, preencha e me envie:

*Nome:*
*WhatsApp:*
*Endereço/Bairro:*

*Marca:*  ( ) D'Luck  ( ) Del Rayssa  ( ) La Paola
*Peça(s):*
*Tamanho:*  ( ) P  ( ) M  ( ) G  ( ) GG
*Cor:*
*Quantidade:*

*Pagamento:*  ( ) Pix  ( ) Cartão  ( ) Dinheiro
*Receber:*  ( ) Entrega  ( ) Retirada

*Observação:*

Obrigada pela preferência!`,
};

const ICONE_WHATSAPP = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M4 20l1.3-3.8A8 8 0 1 1 8 19z"/><path d="M9 9.5c.3 2.3 2.2 4.2 4.5 4.5l1-1.2 2 1-.5 1.7c-3.6.2-7.7-3.8-7.5-7.5l1.7-.5 1 2z" fill="currentColor" stroke="none"/></svg>`;
const ICONE_INSTAGRAM = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="4.5"/><circle cx="12" cy="12" r="3.6"/><circle cx="16.6" cy="7.4" r=".9" fill="currentColor" stroke="none"/></svg>`;

const COMPONENTES = {
  frente: () => `
    <div class="card front">
      <div class="logo">
        <div class="n gloss">Adeylma <em>Vieira</em></div>
        <div class="t">Moda &amp; Lingerie</div>
      </div>
    </div>`,

  verso: () => `
    <div class="card back">
      <div class="edge gloss">Adeylma</div>
      <div class="info">
        <div>
          <div class="who">${MARCA.nome}</div>
          <div class="role">Revendedora</div>
        </div>
        <div class="brands">D'Luck · Del Rayssa Lingerie<br>La Paola Lingerie</div>
        <div class="contact">
          <div>${ICONE_WHATSAPP}${MARCA.whatsapp}</div>
          <div>${ICONE_INSTAGRAM}@${MARCA.instagram}</div>
        </div>
      </div>
    </div>`,

  instagram: () => `
    <div class="ig">
      <div class="ig-top">
        <div class="avatar"><div><span>A<i>V</i></span></div></div>
        <div class="ig-meta">
          <div class="handle">${MARCA.instagram}</div>
          <div class="stats">Posts · Seguidores · Seguindo</div>
        </div>
      </div>
      <div class="bio">
        <b>${MARCA.nome} | Moda &amp; Lingerie</b>
        <span class="cat">Loja de roupas</span>
        ${TEXTOS.bio.split("\n").map(l => `<span>${l}</span>`).join("")}
        <a href="${MARCA.waLink}">${MARCA.waLink.replace("https://", "")}</a>
      </div>
      <div class="hl">
        ${[["Novo", "Novidades"], ["DL", "D'Luck"], ["DR", "Del Rayssa"], ["LP", "La Paola"], ["Ped", "Como pedir"]]
          .map(([s, c]) => `<figure><div class="ring"><span>${s}</span></div><figcaption>${c}</figcaption></figure>`).join("")}
      </div>
      <div class="feed">
        <div class="tile claro"><div><div class="big">Chegou<br><em>novidade</em></div><div class="sm">D'Luck</div></div></div>
        <div class="tile photo"><span>foto da peça</span></div>
        <div class="tile destaque"><div><div class="big">Moda<br><em>íntima</em></div><div class="sm">Del Rayssa</div></div></div>
        <div class="tile photo"><span>foto da peça</span></div>
        <div class="tile claro"><div><div class="big"><em>Como</em><br>pedir</div><div class="sm">WhatsApp</div></div></div>
        <div class="tile photo"><span>foto da peça</span></div>
        <div class="tile destaque"><div><div class="big">Praia<br>&amp; <em>fitness</em></div><div class="sm">La Paola</div></div></div>
        <div class="tile photo"><span>foto da peça</span></div>
        <div class="tile claro"><div><div class="big">Adeylma<br><em>Vieira</em></div><div class="sm">Revendedora</div></div></div>
      </div>
    </div>`,
};

function escapar(texto) {
  return texto.replace(/&/g, "&amp;").replace(/</g, "&lt;");
}

document.querySelectorAll("[data-comp]").forEach(el => {
  el.innerHTML = COMPONENTES[el.dataset.comp]();
});
document.querySelectorAll("[data-texto]").forEach(el => {
  el.innerHTML = escapar(TEXTOS[el.dataset.texto]);
});
