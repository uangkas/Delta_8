[CmdletBinding()]
param(
    [string]$Repo = "",
    [string]$FirebaseServiceAccountPath = ".\firebase-service-account.json",
    [string]$ClaspCredentialsPath = "$HOME\.clasprc.json",
    [string]$GasScriptId = "",
    [string]$ClaspConfigPath = ".\gas_fix\.clasp.json"
)

$ErrorActionPreference = "Stop"
$script:GitHubCli = $null

function Resolve-GitHubCli {
    $command = Get-Command gh -ErrorAction SilentlyContinue
    if ($command) {
        return $command.Source
    }

    $fallbacks = @(
        "C:\Program Files\GitHub CLI\gh.exe",
        "C:\Program Files (x86)\GitHub CLI\gh.exe",
        "$HOME\AppData\Local\Programs\GitHub CLI\gh.exe"
    )

    foreach ($path in $fallbacks) {
        if (Test-Path -LiteralPath $path) {
            return $path
        }
    }

    throw "Command 'gh' tidak ditemukan. Install dulu lalu coba lagi."
}

function Invoke-GitHubCli {
    param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Arguments)

    & $script:GitHubCli @Arguments
}

function Resolve-RequiredPath {
    param([Parameter(Mandatory = $true)][string]$PathValue)

    if (-not (Test-Path -LiteralPath $PathValue)) {
        throw "File tidak ditemukan: $PathValue"
    }

    return (Resolve-Path -LiteralPath $PathValue).Path
}

function Get-SecretBodyFromFile {
    param([Parameter(Mandatory = $true)][string]$FilePath)

    $body = Get-Content -Raw -LiteralPath $FilePath
    $extension = [System.IO.Path]::GetExtension($FilePath)

    if ($extension -ieq ".json") {
        try {
            return ($body | ConvertFrom-Json | ConvertTo-Json -Compress -Depth 20)
        } catch {
            return $body
        }
    }

    return $body
}

function Set-SecretFromFile {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][string]$FilePath,
        [string]$RepoName
    )

    Write-Host "Setting secret $Name dari $FilePath"
    $body = Get-SecretBodyFromFile -FilePath $FilePath
    if ($RepoName) {
        Invoke-GitHubCli secret set $Name --repo $RepoName --body $body
    } else {
        Invoke-GitHubCli secret set $Name --body $body
    }
}

function Set-SecretFromValue {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][string]$Value,
        [string]$RepoName
    )

    Write-Host "Setting secret $Name"
    if ($RepoName) {
        Invoke-GitHubCli secret set $Name --repo $RepoName --body $Value
    } else {
        Invoke-GitHubCli secret set $Name --body $Value
    }
}

function Resolve-GasScriptId {
    param(
        [string]$ExplicitValue,
        [string]$ConfigPath
    )

    if (-not [string]::IsNullOrWhiteSpace($ExplicitValue)) {
        return $ExplicitValue.Trim()
    }

    if (Test-Path -LiteralPath $ConfigPath) {
        $config = Get-Content -Raw -LiteralPath $ConfigPath | ConvertFrom-Json
        if ($config.scriptId) {
            return [string]$config.scriptId
        }
    }

    throw "GasScriptId belum diisi dan scriptId tidak ditemukan di $ConfigPath"
}

$script:GitHubCli = Resolve-GitHubCli

$firebaseJson = Resolve-RequiredPath -PathValue $FirebaseServiceAccountPath
$claspJson = Resolve-RequiredPath -PathValue $ClaspCredentialsPath
$resolvedGasScriptId = Resolve-GasScriptId -ExplicitValue $GasScriptId -ConfigPath $ClaspConfigPath
$claspBase64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((Get-Content -Raw -LiteralPath $claspJson)))

$firebaseConfig = Get-Content -Raw -LiteralPath $firebaseJson | ConvertFrom-Json
if ($firebaseConfig.project_id -ne "kas-delta-8") {
    throw "project_id pada Firebase service account harus 'kas-delta-8'. Nilai saat ini: $($firebaseConfig.project_id)"
}

Write-Host "Memasang GitHub Secrets untuk repo ini..."
Set-SecretFromFile -Name "FIREBASE_SERVICE_ACCOUNT" -FilePath $firebaseJson -RepoName $Repo
Set-SecretFromValue -Name "CLASP_CREDENTIALS_JSON_B64" -Value $claspBase64 -RepoName $Repo
Set-SecretFromValue -Name "GAS_SCRIPT_ID" -Value $resolvedGasScriptId -RepoName $Repo

Write-Host ""
Write-Host "Selesai. Secret yang terpasang:"
Write-Host "- FIREBASE_SERVICE_ACCOUNT"
Write-Host "- CLASP_CREDENTIALS_JSON_B64"
Write-Host "- GAS_SCRIPT_ID"
