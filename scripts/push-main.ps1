[CmdletBinding()]
param(
    [string]$Message = "Setup auto deploy GAS and Firebase Hosting",
    [string]$Remote = "origin",
    [string]$Branch = "main"
)

$ErrorActionPreference = "Stop"

git add .

$status = git status --short
if (-not $status) {
    Write-Host "Tidak ada perubahan untuk di-commit."
    exit 0
}

git commit -m $Message
git push $Remote "HEAD:$Branch"
