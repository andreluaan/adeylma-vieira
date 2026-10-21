# Adeylma Vieira | Moda & Lingerie

Identidade visual da revendedora Adeylma Vieira (D'Luck, Del Rayssa Lingerie e La Paola Lingerie), com duas versões de cor: preta e bege.

## pdfs/

- `Adeylma-Vieira-Apresentacao.pdf`: apresentação da marca em A4, com as duas versões
- `Adeylma-Vieira-Cartao-Preto.pdf`: cartão preto para a gráfica (9 × 5 cm com 3 mm de sangria)
- `Adeylma-Vieira-Cartao-Bege.pdf`: cartão bege para a gráfica (9 × 5 cm com 3 mm de sangria)

## codigo/

```
codigo/
├── index.html            página da marca, com troca de tema entre preto e bege
├── css/
│   ├── temas.css         cores dos temas preto e bege
│   ├── base.css          estilos gerais
│   ├── componentes.css   assinatura, cartão, perfil do Instagram e caixas de texto
│   ├── pagina.css        layout do index.html
│   ├── pdf-apresentacao.css
│   └── pdf-cartao.css
├── js/
│   ├── dados.js          contatos, marcas revendidas e textos prontos
│   ├── componentes.js    monta o cartão e o perfil a partir dos dados
│   ├── tema-salvo.js     aplica o tema salvo ou o do link (#preto, #bege)
│   ├── seletor-tema.js   botões Preto / Bege
│   └── copiar-texto.js   botões Copiar
├── paginas-pdf/          páginas que viram os PDFs
└── gerar-pdfs.ps1        gera os PDFs de novo em pdfs/
```

Para mudar telefone, Instagram ou textos, edite só `js/dados.js` e rode:

```powershell
.\codigo\gerar-pdfs.ps1
```
