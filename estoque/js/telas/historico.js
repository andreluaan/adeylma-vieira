import { dados } from '../banco.js';
import { linhaMovimento, vazio } from '../componentes.js';
import { $ } from '../util.js';

const LIMITE = 200;

export function desenharHistorico() {
  $('#listaMov').innerHTML = dados.movimentos.length
    ? dados.movimentos.slice(0, LIMITE).map(linhaMovimento).join('')
    : vazio('refresh', 'Nenhum movimento');
}
