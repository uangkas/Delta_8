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
        )
    },
    @{
        Source = "firebase-messaging-sw.js"
        Destinations = @(
            "public\firebase-messaging-sw.js"
        )
    },
    @{
        Source = "app-sw.js"
        Destinations = @(
            "public\app-sw.js"
        )
    },
    @{
        Source = "manifest.webmanifest"
        Destinations = @(
            "public\manifest.webmanifest"
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
$publicAdminHtmlPath = Join-Path $repoRoot "public_admin\admin.html"
$publicAdminAppJsPath = Join-Path $repoRoot "public_admin\app.js"
$publicAdminStylesPath = Join-Path $repoRoot "public_admin\styles.css"
$publicAdminManifestPath = Join-Path $repoRoot "public_admin\manifest.webmanifest"
$publicAdminMessagingSwPath = Join-Path $repoRoot "public_admin\firebase-messaging-sw.js"
$publicAdminAppSwPath = Join-Path $repoRoot "public_admin\app-sw.js"
$publicAdminIconPath = Join-Path $repoRoot "public_admin\notification-icon.svg"
$publicAdminBadgePath = Join-Path $repoRoot "public_admin\notification-badge.svg"
$publicAdminQrisPath = Join-Path $repoRoot "public_admin\QRIS.jpg"
$gasIndexPath = Join-Path $repoRoot "gas_fix\index.html"
$gasAppJsIncludePath = Join-Path $repoRoot "gas_fix\app_js.html"
$gasStylesIncludePath = Join-Path $repoRoot "gas_fix\styles_css.html"

Ensure-DirectoryForFile -Path $publicIndexPath
Ensure-DirectoryForFile -Path $publicAppJsPath
Ensure-DirectoryForFile -Path $publicStylesPath
Ensure-DirectoryForFile -Path $publicAdminHtmlPath
Ensure-DirectoryForFile -Path $publicAdminAppJsPath
Ensure-DirectoryForFile -Path $publicAdminStylesPath
Ensure-DirectoryForFile -Path $publicAdminManifestPath
Ensure-DirectoryForFile -Path $publicAdminMessagingSwPath
Ensure-DirectoryForFile -Path $publicAdminAppSwPath
Ensure-DirectoryForFile -Path $publicAdminIconPath
Ensure-DirectoryForFile -Path $publicAdminBadgePath
Ensure-DirectoryForFile -Path $publicAdminQrisPath
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

Set-Content -LiteralPath $publicAdminHtmlPath -Value $indexSource -Encoding UTF8
Write-Host "Synced index.html -> public_admin\\admin.html"

Set-Content -LiteralPath $publicAdminAppJsPath -Value $appJsSource -Encoding UTF8
Write-Host "Synced app.js -> public_admin\\app.js"

Set-Content -LiteralPath $publicAdminStylesPath -Value $publicStylesSource -Encoding UTF8
Write-Host "Synced styles.css -> public_admin\\styles.css"

Copy-Item -LiteralPath (Join-Path $repoRoot "manifest.webmanifest") -Destination $publicAdminManifestPath -Force
Write-Host "Synced manifest.webmanifest -> public_admin\\manifest.webmanifest"

Copy-Item -LiteralPath (Join-Path $repoRoot "firebase-messaging-sw.js") -Destination $publicAdminMessagingSwPath -Force
Write-Host "Synced firebase-messaging-sw.js -> public_admin\\firebase-messaging-sw.js"

Copy-Item -LiteralPath (Join-Path $repoRoot "app-sw.js") -Destination $publicAdminAppSwPath -Force
Write-Host "Synced app-sw.js -> public_admin\\app-sw.js"

Copy-Item -LiteralPath (Join-Path $repoRoot "public\notification-icon.svg") -Destination $publicAdminIconPath -Force
Write-Host "Synced notification-icon.svg -> public_admin\\notification-icon.svg"

Copy-Item -LiteralPath (Join-Path $repoRoot "public\notification-badge.svg") -Destination $publicAdminBadgePath -Force
Write-Host "Synced notification-badge.svg -> public_admin\\notification-badge.svg"

Copy-Item -LiteralPath (Join-Path $repoRoot "public\QRIS.jpg") -Destination $publicAdminQrisPath -Force
Write-Host "Synced QRIS.jpg -> public_admin\\QRIS.jpg"

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
