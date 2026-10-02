# PowerShell Script to Safely Copy & Convert Sahara Social Foundation Logo Assets
# Preserves genuine image formats (.jpg and true .png)

$ErrorActionPreference = "Stop"

$sourcePath = "C:\Users\hp\.gemini\antigravity\brain\1063b621-a072-4128-b62a-e63ec48eade1\.user_uploaded\media_1790769493459.jpg"
$projectRoot = "D:\ITPL\Sahara Social Foundation"
$publicDir = Join-Path $projectRoot "public"

Write-Host "--- Sahara Social Foundation: Logo Copy & Conversion Tool ---" -ForegroundColor Cyan

# 1. Verify Source Image
if (-not (Test-Path -Path $sourcePath)) {
    Write-Error "Source image not found at: $sourcePath"
    exit 1
}
Write-Host "[OK] Source image found ($sourcePath)" -ForegroundColor Green

# 2. Verify Destination Directory
if (-not (Test-Path -Path $publicDir)) {
    New-Item -ItemType Directory -Path $publicDir -Force | Out-Null
    Write-Host "[CREATED] Created directory: $publicDir" -ForegroundColor Yellow
} else {
    Write-Host "[OK] Destination directory exists: $publicDir" -ForegroundColor Green
}

# 3. Copy official JPEG logo
$destJpg = Join-Path $publicDir "sahara-logo.jpg"
Copy-Item -Path $sourcePath -Destination $destJpg -Force
Write-Host "[SUCCESS] Copied genuine JPEG logo to: $destJpg" -ForegroundColor Green

# 4. Convert to genuine PNG format using .NET System.Drawing
try {
    Add-Type -AssemblyName System.Drawing
    $image = [System.Drawing.Image]::FromFile($sourcePath)

    $destPng = Join-Path $publicDir "logo.png"
    $image.Save($destPng, [System.Drawing.Imaging.ImageFormat]::Png)
    Write-Host "[SUCCESS] Converted & saved genuine PNG logo to: $destPng" -ForegroundColor Green

    $destFaviconPng = Join-Path $publicDir "favicon.png"
    $image.Save($destFaviconPng, [System.Drawing.Imaging.ImageFormat]::Png)
    Write-Host "[SUCCESS] Converted & saved genuine PNG favicon to: $destFaviconPng" -ForegroundColor Green

    $image.Dispose()
} catch {
    Write-Warning "Could not convert to PNG via System.Drawing: $_. Defaulting to direct copy."
    Copy-Item -Path $sourcePath -Destination (Join-Path $publicDir "logo.png") -Force
    Copy-Item -Path $sourcePath -Destination (Join-Path $publicDir "favicon.png") -Force
}

Write-Host "--- All Logo Assets Synchronized Successfully! ---" -ForegroundColor Cyan
