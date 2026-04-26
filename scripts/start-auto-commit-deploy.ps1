[CmdletBinding()]
param(
    [int]$IntervalSeconds = 20,
    [string]$Remote = "origin",
    [string]$Branch = "main",
    [string]$MessagePrefix = "Auto sync"
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$stateDir = Join-Path $scriptDir ".auto-sync"
$pidPath = Join-Path $stateDir "auto-sync.pid"
$runnerPath = Join-Path $scriptDir "auto-commit-deploy.ps1"

New-Item -ItemType Directory -Path $stateDir -Force | Out-Null

if (Test-Path -LiteralPath $pidPath) {
    $existingPid = (Get-Content -LiteralPath $pidPath -ErrorAction SilentlyContinue | Select-Object -First 1)
    if ($existingPid) {
        $existingProcess = Get-Process -Id ([int]$existingPid) -ErrorAction SilentlyContinue
        if ($existingProcess) {
            Write-Host "Auto commit + deploy sudah aktif. PID: $existingPid"
            exit 0
        }
    }
}

$argList = "-ExecutionPolicy Bypass -File `"$runnerPath`" -IntervalSeconds $IntervalSeconds -Remote `"$Remote`" -Branch `"$Branch`" -MessagePrefix `"$MessagePrefix`""

$proc = Start-Process -FilePath "powershell.exe" -ArgumentList $argList -WindowStyle Hidden -PassThru
Set-Content -Path $pidPath -Value $proc.Id
Write-Host "Auto commit + deploy aktif. PID: $($proc.Id)"
