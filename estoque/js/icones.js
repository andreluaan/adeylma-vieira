// Ícones do Nanquim System (andreluaan/Nanquim-System, src/icons/icons.js): grade 24×24, traço de 1.75.
// Só os ícones usados no estoque.
const ICONES = {
  "home": "<path d=\"M4 11l8-7 8 7M6 9.5V20h12V9.5M10 20v-5h4v5\"/>",
  "grid": "<rect x=\"4\" y=\"4\" width=\"6.5\" height=\"6.5\" rx=\"1\"/><rect x=\"13.5\" y=\"4\" width=\"6.5\" height=\"6.5\" rx=\"1\"/><rect x=\"4\" y=\"13.5\" width=\"6.5\" height=\"6.5\" rx=\"1\"/><rect x=\"13.5\" y=\"13.5\" width=\"6.5\" height=\"6.5\" rx=\"1\"/>",
  "sliders": "<path d=\"M4 7h10M18 7h2M4 17h4M12 17h8\"/><circle cx=\"16\" cy=\"7\" r=\"2\"/><circle cx=\"10\" cy=\"17\" r=\"2\"/>",
  "refresh": "<path d=\"M19.5 13.5a7.5 7.5 0 1 1-1.7-7.3L20 8.5M20 4v4.5h-4.5\"/>",
  "lock": "<rect x=\"5\" y=\"10.5\" width=\"14\" height=\"10\" rx=\"2\"/><path d=\"M8 10.5v-3a4 4 0 0 1 8 0v3\"/>",
  "copy": "<rect x=\"8\" y=\"8\" width=\"12\" height=\"12\" rx=\"2\"/><path d=\"M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3\"/>",
  "eye": "<path d=\"M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>",
  "sun": "<circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4\"/>",
  "moon": "<path d=\"M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z\"/>",
  "plus": "<path d=\"M12 5v14M5 12h14\"/>",
  "minus": "<path d=\"M5 12h14\"/>",
  "edit": "<path d=\"M4 20h4L19 9l-4-4L4 16v4ZM14 6l4 4\"/>",
  "trash": "<path d=\"M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3\"/>",
  "search": "<circle cx=\"11\" cy=\"11\" r=\"6.5\"/><path d=\"M16 16l4 4\"/>",
  "alert": "<path d=\"M12 4L2.8 19.5h18.4L12 4ZM12 10v4.5M12 17.25h.01\"/>",
  "image": "<rect x=\"3.5\" y=\"4.5\" width=\"17\" height=\"15\" rx=\"2\"/><circle cx=\"9\" cy=\"9.5\" r=\"1.75\"/><path d=\"M20.5 15.5l-5-5L5 19.5\"/>",
  "arrow-down": "<path d=\"M12 5v14M6 13l6 6 6-6\"/>",
  "arrow-up": "<path d=\"M12 19V5M6 11l6-6 6 6\"/>",
  "star": "<path d=\"M12 3.5l2.6 5.3 5.9.9-4.25 4.1 1 5.85L12 16.9l-5.25 2.75 1-5.85L3.5 9.7l5.9-.9L12 3.5Z\"/>",
  "download": "<path d=\"M12 4v11M7 10l5 5 5-5M5 20h14\"/>",
  "upload": "<path d=\"M12 15V4M7 9l5-5 5 5M5 20h14\"/>",
  "check-circle": "<circle cx=\"12\" cy=\"12\" r=\"8.5\"/><path d=\"M8 12.5l2.75 2.75L16 10\"/>",
  "check": "<path d=\"M5 12.5l4.5 4.5L19 7.5\"/>",
  "calendar": "<rect x=\"4\" y=\"5.5\" width=\"16\" height=\"15\" rx=\"2\"/><path d=\"M4 10h16M8.5 3.5v4M15.5 3.5v4\"/>",
  "x": "<path d=\"M6 6l12 12M18 6L6 18\"/>",
  "cart": "<path d=\"M3 4h2.5l2.2 11h10.6l2-8H6.3\"/><circle cx=\"9.5\" cy=\"19.5\" r=\"1.25\"/><circle cx=\"17\" cy=\"19.5\" r=\"1.25\"/>",
  "user": "<circle cx=\"12\" cy=\"8\" r=\"4\"/><path d=\"M4 20c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5\"/>",
  "info": "<circle cx=\"12\" cy=\"12\" r=\"8.5\"/><path d=\"M12 11v5.5M12 8h.01\"/>",
};

export function icone(nome) {
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONES[nome] ?? ""}</svg>`;
}

/** Troca cada <i data-icone="nome"> do HTML pelo SVG correspondente. */
export function trocarIcones(raiz = document) {
  raiz.querySelectorAll("i[data-icone]").forEach(i => { i.outerHTML = icone(i.dataset.icone); });
}
