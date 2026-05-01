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
        Source = "admin.html"
        Destinations = @(
            "gas_fix\admin.html"
            "public_admin\index.html"
        )
    },
    @{
        Source = "firebase-messaging-sw.js"
        Destinations = @(
            "public\firebase-messaging-sw.js"
        )
    }
)

function Ensure-DirectoryForFile {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    $destinationDir = Split-Path -Parent $Path
    if ($destinationDir -and -not (Test-Path -LiteralPath $destinationDir)) {
        New-Item -ItemType Directory -Path $destinationDir -Force | Out-Null
    }
}

foreach ($entry in $syncMap) {
    $sourcePath = Join-Path $repoRoot $entry.Source
    if (-not (Test-Path -LiteralPath $sourcePath)) {
        throw "Source tidak ditemukan: $sourcePath"
    }

    foreach ($relativeDestination in $entry.Destinations) {
        $destinationPath = Join-Path $repoRoot $relativeDestination
        Ensure-DirectoryForFile -Path $destinationPath

        Copy-Item -LiteralPath $sourcePath -Destination $destinationPath -Force
        Write-Host "Synced $($entry.Source) -> $relativeDestination"
    }
}

$indexSourcePath = Join-Path $repoRoot "index.html"
$appJsSourcePath = Join-Path $repoRoot "app.js"
$stylesSourcePath = Join-Path $repoRoot "styles.css"

if (-not (Test-Path -LiteralPath $indexSourcePath)) {
    throw "Source tidak ditemukan: $indexSourcePath"
}
if (-not (Test-Path -LiteralPath $appJsSourcePath)) {
    throw "Source tidak ditemukan: $appJsSourcePath"
}
if (-not (Test-Path -LiteralPath $stylesSourcePath)) {
    throw "Source tidak ditemukan: $stylesSourcePath"
}

$indexSource = Get-Content -LiteralPath $indexSourcePath -Raw
$appJsSource = Get-Content -LiteralPath $appJsSourcePath -Raw
$stylesSource = Get-Content -LiteralPath $stylesSourcePath -Raw

$publicIndexPath = Join-Path $repoRoot "public\index.html"
$publicAppJsPath = Join-Path $repoRoot "public\app.js"
$publicStylesPath = Join-Path $repoRoot "public\styles.css"
$gasIndexPath = Join-Path $repoRoot "gas_fix\index.html"
$gasAppJsIncludePath = Join-Path $repoRoot "gas_fix\app_js.html"
$gasStylesIncludePath = Join-Path $repoRoot "gas_fix\styles_css.html"

Ensure-DirectoryForFile -Path $publicIndexPath
Ensure-DirectoryForFile -Path $publicAppJsPath
Ensure-DirectoryForFile -Path $publicStylesPath
Ensure-DirectoryForFile -Path $gasIndexPath
Ensure-DirectoryForFile -Path $gasAppJsIncludePath
Ensure-DirectoryForFile -Path $gasStylesIncludePath

Set-Content -LiteralPath $publicIndexPath -Value $indexSource -Encoding UTF8
Write-Host "Synced index.html -> public\\index.html"

Set-Content -LiteralPath $publicAppJsPath -Value $appJsSource -Encoding UTF8
Write-Host "Synced app.js -> public\\app.js"

$publicStylesSource = $stylesSource
Set-Content -LiteralPath $publicStylesPath -Value $publicStylesSource -Encoding UTF8
Write-Host "Synced styles.css -> public\\styles.css"

$gasIndexSource = $indexSource.Replace('<link rel="stylesheet" href="./styles.css">', '<?!= include("styles_css"); ?>')
$gasIndexSource = $gasIndexSource.Replace('<script src="./app.js"></script>', '<?!= include("app_js"); ?>')
Set-Content -LiteralPath $gasIndexPath -Value $gasIndexSource -Encoding UTF8
Write-Host "Synced index.html -> gas_fix\\index.html"

$gasAppInclude = "<script>`r`n$appJsSource`r`n</script>`r`n"
Set-Content -LiteralPath $gasAppJsIncludePath -Value $gasAppInclude -Encoding UTF8
Write-Host "Generated app.js -> gas_fix\\app_js.html"

$gasStylesInclude = "<style>`r`n$stylesSource`r`n</style>`r`n"
Set-Content -LiteralPath $gasStylesIncludePath -Value $gasStylesInclude -Encoding UTF8
Write-Host "Generated styles.css -> gas_fix\\styles_css.html"
