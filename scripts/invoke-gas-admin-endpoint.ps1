[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$Url,
    [Parameter(Mandatory = $true)][string]$Action,
    [Parameter(Mandatory = $true)][string]$AuthToken,
    [switch]$AllowFailure
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($Url)) {
    throw "Url wajib diisi."
}

if ([string]::IsNullOrWhiteSpace($Action)) {
    throw "Action wajib diisi."
}

if ([string]::IsNullOrWhiteSpace($AuthToken)) {
    throw "AuthToken wajib diisi."
}

$baseUrl = $Url.Trim()
$separator = if ($baseUrl.Contains("?")) { "&" } else { "?" }
$requestUrl = "{0}{1}action={2}&authToken={3}" -f $baseUrl, $separator, [uri]::EscapeDataString($Action.Trim()), [uri]::EscapeDataString($AuthToken.Trim())

Write-Host "Calling GAS admin endpoint: $Action"
$response = Invoke-RestMethod -Uri $requestUrl -Method Get -TimeoutSec 60

if ($null -eq $response) {
    if ($AllowFailure) {
        Write-Warning "Endpoint $Action tidak mengembalikan respons."
        exit 0
    }
    throw "Endpoint $Action tidak mengembalikan respons."
}

if ($response.ok -ne $true) {
    $message = if ($response.error) { [string]$response.error } else { "Respons $Action tidak ok." }
    if ($AllowFailure) {
        Write-Warning $message
        exit 0
    }
    throw $message
}

$response | ConvertTo-Json -Depth 20
