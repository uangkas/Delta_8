[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot

$syncMap = @(
    @{
        Source = "Code.gs"
        Destinations = @(
            "gas_fix\Kode.js"
        )
    },
    @{
        Source = "index.html"
        Destinations = @(
            "gas_fix\index.html"
            "public\index.html"
        )
    },
    @{
        Source = "firebase-messaging-sw.js"
        Destinations = @(
            "public\firebase-messaging-sw.js"
        )
    }
)

foreach ($entry in $syncMap) {
    $sourcePath = Join-Path $repoRoot $entry.Source
    if (-not (Test-Path -LiteralPath $sourcePath)) {
        throw "Source tidak ditemukan: $sourcePath"
    }

    foreach ($relativeDestination in $entry.Destinations) {
        $destinationPath = Join-Path $repoRoot $relativeDestination
        $destinationDir = Split-Path -Parent $destinationPath

        if ($destinationDir -and -not (Test-Path -LiteralPath $destinationDir)) {
            New-Item -ItemType Directory -Path $destinationDir -Force | Out-Null
        }

        Copy-Item -LiteralPath $sourcePath -Destination $destinationPath -Force
        Write-Host "Synced $($entry.Source) -> $relativeDestination"
    }
}
