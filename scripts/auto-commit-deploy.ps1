[CmdletBinding()]
param(
    [int]$IntervalSeconds = 20,
    [string]$Remote = "origin",
    [string]$Branch = "main",
    [string]$MessagePrefix = "Auto sync"
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptDir
$stateDir = Join-Path $scriptDir ".auto-sync"
$pidPath = Join-Path $stateDir "auto-sync.pid"
$logPath = Join-Path $stateDir "auto-sync.log"
$heartbeatPath = Join-Path $stateDir "heartbeat.txt"
$lockPath = Join-Path $stateDir "running.lock"

if ($IntervalSeconds -lt 10) {
    $IntervalSeconds = 10
}

New-Item -ItemType Directory -Path $stateDir -Force | Out-Null
Set-Content -Path $pidPath -Value $PID

function Write-AutoSyncLog {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Add-Content -Path $logPath -Value "[$timestamp] $Message"
    Set-Content -Path $heartbeatPath -Value $timestamp
}

function Get-RepoStatus {
    $statusOutput = git -C $repoRoot status --short
    if ($LASTEXITCODE -ne 0) {
        throw "Gagal membaca status git."
    }
    return @($statusOutput)
}

function Invoke-AutoPush {
    $message = "$MessagePrefix $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    Write-AutoSyncLog "Menjalankan auto commit dan push."
    & powershell -ExecutionPolicy Bypass -File (Join-Path $scriptDir "push-main.ps1") -Message $message -Remote $Remote -Branch $Branch
    if ($LASTEXITCODE -ne 0) {
        throw "push-main.ps1 gagal dengan exit code $LASTEXITCODE."
    }
}

try {
    Write-AutoSyncLog "Watcher aktif. Interval $IntervalSeconds detik."
    while ($true) {
        try {
            if (-not (Test-Path -LiteralPath $lockPath)) {
                New-Item -ItemType File -Path $lockPath -Force | Out-Null
            }

            $status = Get-RepoStatus
            if ($status.Count -gt 0) {
                Invoke-AutoPush
            }
        } catch {
            Write-AutoSyncLog ("Loop error: " + $_.Exception.Message)
        }

        Start-Sleep -Seconds $IntervalSeconds
    }
} catch {
    Write-AutoSyncLog ("ERROR: " + $_.Exception.Message)
    throw
} finally {
    Remove-Item -LiteralPath $lockPath -Force -ErrorAction SilentlyContinue
    Remove-Item -LiteralPath $pidPath -Force -ErrorAction SilentlyContinue
    Write-AutoSyncLog "Watcher berhenti."
}
