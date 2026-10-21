const MARCA = {
  nome: "Adeylma Vieira",
  slogan: "Moda & Lingerie",
  whatsapp: "(83) 99694-3038",
  linkWhatsapp: "https://wa.me/5583996943038",
  instagram: "adeylmavieira",
  marcasRevendidas: ["D'Luck", "Del Rayssa Lingerie", "La Paola Lingerie"],
};

const DESTAQUES_INSTAGRAM = [
  { capa: "Novo", nome: "Novidades" },
  { capa: "DL", nome: "D'Luck" },
  { capa: "DR", nome: "Del Rayssa" },
  { capa: "LP", nome: "La Paola" },
  { capa: "Ped", nome: "Como pedir" },
];

const POSTS_INSTAGRAM = [
  { tipo: "arte", titulo: "Chegou<br><em>novidade</em>", legenda: "D'Luck" },
  { tipo: "foto" },
  { tipo: "cor", titulo: "Moda<br><em>íntima</em>", legenda: "Del Rayssa" },
  { tipo: "foto" },
  { tipo: "arte", titulo: "<em>Como</em><br>pedir", legenda: "WhatsApp" },
  { tipo: "foto" },
  { tipo: "cor", titulo: "Praia<br>&amp; <em>fitness</em>", legenda: "La Paola" },
  { tipo: "foto" },
  { tipo: "arte", titulo: "Adeylma<br><em>Vieira</em>", legenda: "Revendedora" },
];

const TEXTOS_PRONTOS = {
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
