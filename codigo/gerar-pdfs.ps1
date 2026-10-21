# Gera os PDFs em ..\pdfs a partir das páginas em .\paginas-pdf, usando o Microsoft Edge.

$pastaDoCodigo = $PSScriptRoot
$pastaDosPdfs = Join-Path (Split-Path $pastaDoCodigo -Parent) "pdfs"
$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$perfilTemporario = Join-Path $env:TEMP "adeylma-edge"
$enderecoDasPaginas = ([System.Uri](Join-Path $pastaDoCodigo "paginas-pdf")).AbsoluteUri

$pdfs = @(
  @{ Pagina = "apresentacao.html"; Arquivo = "Adeylma-Vieira-Apresentacao.pdf" },
  @{ Pagina = "cartao.html#preto"; Arquivo = "Adeylma-Vieira-Cartao-Preto.pdf" },
  @{ Pagina = "cartao.html#bege"; Arquivo = "Adeylma-Vieira-Cartao-Bege.pdf" }
)

New-Item -ItemType Directory -Force $pastaDosPdfs | Out-Null

foreach ($pdf in $pdfs) {
  $destino = Join-Path $pastaDosPdfs $pdf.Arquivo

  Start-Process -FilePath $edge -Wait -ArgumentList @(
    "--headless",
    "--disable-gpu",
    "--no-pdf-header-footer",
    "--virtual-time-budget=8000",
    "--user-data-dir=`"$perfilTemporario`"",
    "--print-to-pdf=`"$destino`"",
    "$enderecoDasPaginas/$($pdf.Pagina)"
  )

  Write-Output "Gerado: $($pdf.Arquivo)"
}
