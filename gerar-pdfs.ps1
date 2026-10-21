# Gera os PDFs em .\arquivos a partir das páginas em .\pdf, usando o Microsoft Edge.
$raiz = $PSScriptRoot
$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$perfil = Join-Path $env:TEMP "adeylma-edge"
$saida = Join-Path $raiz "arquivos"
New-Item -ItemType Directory -Force $saida | Out-Null

$base = ([System.Uri](Join-Path $raiz "pdf")).AbsoluteUri
$pdfs = @(
  @{ url = "$base/apresentacao.html"; nome = "Adeylma-Vieira-Apresentacao.pdf" },
  @{ url = "$base/cartao.html"; nome = "Adeylma-Vieira-Cartao-Preto.pdf" },
  @{ url = "$base/cartao.html#bege"; nome = "Adeylma-Vieira-Cartao-Bege.pdf" }
)

foreach ($p in $pdfs) {
  $destino = Join-Path $saida $p.nome
  Start-Process -FilePath $edge -Wait -ArgumentList @(
    "--headless", "--disable-gpu", "--no-pdf-header-footer", "--virtual-time-budget=8000",
    "--user-data-dir=`"$perfil`"", "--print-to-pdf=`"$destino`"", $p.url
  )
  Write-Output "Gerado: $($p.nome)"
}
