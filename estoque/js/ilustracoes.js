// Desenhos padrão para produto sem foto, escolhidos pela categoria.
// Traço fino no mesmo estilo dos ícones (grade 120×120, cor do texto); categoria desconhecida vira um cabide.

const SUTIA = `
  <path d="M38 24l4 26M82 24l-4 26"/>
  <path d="M18 54c8-8 22-10 42 12 20-22 34-20 42-12"/>
  <path d="M18 54c2 20 24 30 42 12 18 18 40 8 42-12"/>
  <path d="M18 54v8M102 54v8"/>`;

const CALCINHA = `
  <path d="M20 38h80l-8 20c-10 6-20 16-24 32H52c-4-16-14-26-24-32z"/>
  <path d="M23 46h74"/>`;

const PIJAMA = `
  <path d="M40 24l12-6h16l12 6 18 18-10 10-8-6v52H40V46l-8 6-10-10z"/>
  <path d="M52 18l8 12 8-12"/>
  <path d="M60 30v66"/>
  <circle cx="54" cy="46" r="1.5"/><circle cx="54" cy="62" r="1.5"/><circle cx="54" cy="78" r="1.5"/>`;

const CONJUNTO = `
  <g transform="translate(18 2) scale(.7)">${SUTIA}</g>
  <g transform="translate(24 52) scale(.6)">${CALCINHA}</g>`;

const CABIDE = `
  <path d="M60 46v-4c0-4 4-6 7-8a8 8 0 1 0-14-6"/>
  <path d="M60 46L16 78h88z"/>`;

const POR_CATEGORIA = [
  [/suti/, SUTIA],
  [/calcinh|tanga|cueca/, CALCINHA],
  [/conjunt|lingerie|body/, CONJUNTO],
  [/pijam|camisol|robe/, PIJAMA],
];

const semAcento = texto => texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function ilustracao(categoria = '') {
  const nome = semAcento(categoria);
  const desenho = POR_CATEGORIA.find(([padrao]) => padrao.test(nome))?.[1] ?? CABIDE;
  return `<svg class="ilustracao" viewBox="0 0 120 120" aria-hidden="true">${desenho}</svg>`;
}
