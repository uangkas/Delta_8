[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$stateDir = Join-Path $scriptDir ".auto-sync"
$pidPath = Join-Path $stateDir "auto-sync.pid"

if (-not (Test-Path -LiteralPath $pidPath)) {
    Write-Host "Auto commit + deploy tidak sedang berjalan."
    exit 0
}

$targetPid = Get-Content -LiteralPath $pidPath -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $targetPid) {
    Remove-Item -LiteralPath $pidPath -Force -ErrorAction SilentlyContinue
    Write-Host "PID watcher tidak valid. File state dibersihkan."
    exit 0
}

$proc = Get-Process -Id ([int]$targetPid) -ErrorAction SilentlyContinue
if ($proc) {
    Stop-Process -Id $proc.Id -Force
    Write-Host "Auto commit + deploy dihentikan. PID: $targetPid"
} else {
    Write-Host "Proses watcher tidak ditemukan. Membersihkan file state."
}

Remove-Item -LiteralPath $pidPath -Force -ErrorAction SilentlyContinue
