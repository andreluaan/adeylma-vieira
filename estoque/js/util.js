export const $ = seletor => document.querySelector(seletor);
export const $$ = seletor => [...document.querySelectorAll(seletor)];

export const real = valor => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export const dataCurta = ms => new Date(ms).toLocaleDateString('pt-BR');
export const dataHora = ms => new Date(ms).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
export const hojeISO = () => new Date().toISOString().slice(0, 10);

/** "1.234,56" → 1234.56 */
export const numero = texto => parseFloat(String(texto).replace(/\./g, '').replace(',', '.')) || 0;
export const inteiro = texto => Math.max(0, parseInt(texto, 10) || 0);
export const paraCampo = valor => valor.toFixed(2).replace('.', ',');

const ENTIDADES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
export const escapar = texto => String(texto).replace(/[&<>"]/g, c => ENTIDADES[c]);

export function avisar(texto) {
  const aviso = $('#aviso');
  // Dentro da janela aberta, senão ficaria escondido atrás dela
  (document.querySelector('dialog[open]') ?? document.body).append(aviso);
  aviso.textContent = texto;
  aviso.classList.add('mostrar');
  clearTimeout(aviso.timer);
  aviso.timer = setTimeout(() => aviso.classList.remove('mostrar'), 2200);
}
