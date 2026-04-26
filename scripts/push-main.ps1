[CmdletBinding()]
param(
    [string]$Message = "Setup auto deploy GAS and Firebase Hosting",
    [string]$Remote = "origin",
    [string]$Branch = "main"
)

$ErrorActionPreference = "Stop"

& (Join-Path $PSScriptRoot "sync-deploy-sources.ps1")

if ($LASTEXITCODE -ne 0) {
    Write-Error "Gagal sinkronisasi source. Push dibatalkan."
    exit $LASTEXITCODE
}

git add .

$status = git status --short
if (-not $status) {
    Write-Host "Tidak ada perubahan untuk di-commit."
    exit 0
}

git commit -m $Message
git pull $Remote $Branch --rebase
git push $Remote "HEAD:$Branch"
