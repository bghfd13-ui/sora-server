$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Api = Join-Path $Root "api"
$Roblox = Join-Path $Root "Roblox"

Write-Host "=============================================="
Write-Host "        RELIVE AVATAR COMPLETE FIX"
Write-Host "=============================================="

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backup = Join-Path $Root "backups\AvatarFix-$stamp"
New-Item -ItemType Directory -Force -Path $backup | Out-Null

$files = @(
    "Roblox\Roblox.Website\Controllers\RobloxApi\Thumbnails.cs",
    "Roblox\Roblox.Services\Thumbnails.cs",
    "Roblox\Roblox.Models\Metadata\Avatar.cs",
    "Roblox\Roblox.Models\Roblox.Models.csproj"
)
foreach ($f in $files) {
    $src = Join-Path $Root $f
    if (Test-Path $src) {
        $dst = Join-Path $backup ($f -replace '\\','__')
        Copy-Item $src $dst -Force
    }
}

Write-Host "[1/3] Checking avatar database..."
Push-Location $Api
node .\ensure-avatar-db.js
if ($LASTEXITCODE -ne 0) { throw "Avatar database check failed." }
Pop-Location

Write-Host "[2/3] Ensuring migrations are up to date..."
Push-Location $Api
npx knex migrate:latest
if ($LASTEXITCODE -ne 0) { throw "Knex migration failed." }
node .\ensure-avatar-db.js
if ($LASTEXITCODE -ne 0) { throw "Final avatar database verification failed." }
Pop-Location

Write-Host "[3/3] Verifying avatar color data..."
$color = Join-Path $Roblox "Roblox.Libraries\Json\avatar-colors.json"
if (!(Test-Path $color)) { throw "Missing avatar-colors.json: $color" }
Write-Host "[OK] avatar-colors.json found."

Write-Host ""
Write-Host "DONE. Backup: $backup"
Write-Host "Restart Sora after this script finishes."
