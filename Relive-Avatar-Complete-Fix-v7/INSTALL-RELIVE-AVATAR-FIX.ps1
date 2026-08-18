$ErrorActionPreference = 'Stop'
$PackageRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $PackageRoot

Write-Host '=============================================='
Write-Host '       RELIVE AVATAR COMPLETE FIX v7'
Write-Host '=============================================='
Write-Host ('Project root: ' + $ProjectRoot)

$backup = Join-Path $ProjectRoot ('backups\ReliveAvatarFix-' + (Get-Date -Format 'yyyyMMdd-HHmmss'))
New-Item -ItemType Directory -Force -Path $backup | Out-Null

function Install-File($packageRelative, $projectRelative) {
    $src = Join-Path $PackageRoot $packageRelative
    $dst = Join-Path $ProjectRoot $projectRelative
    if (-not (Test-Path $src)) { throw ('Missing fix file: ' + $src) }
    if (([IO.Path]::GetFullPath($src)) -eq ([IO.Path]::GetFullPath($dst))) { throw 'Source and destination are the same file.' }
    if (Test-Path $dst) {
        $b = Join-Path $backup $projectRelative
        New-Item -ItemType Directory -Force -Path (Split-Path $b) | Out-Null
        Copy-Item $dst $b -Force
    }
    New-Item -ItemType Directory -Force -Path (Split-Path $dst) | Out-Null
    Copy-Item $src $dst -Force
    Write-Host ('  OK ' + $projectRelative)
}

Write-Host '[1/5] Installing thumbnail controller...'
Install-File 'Roblox\Roblox.Website\Controllers\RobloxApi\Thumbnails.cs' 'Roblox\Roblox.Website\Controllers\RobloxApi\Thumbnails.cs'

Write-Host '[2/5] Installing avatar DB helper and migration...'
Install-File 'api\ensure-avatar-db.js' 'api\ensure-avatar-db.js'
Install-File 'api\migrations\20260818130000_add_avatar_3d_url.js' 'api\migrations\20260818130000_add_avatar_3d_url.js'

Push-Location (Join-Path $ProjectRoot 'api')
try {
    node '.\ensure-avatar-db.js'
    if ($LASTEXITCODE -ne 0) { throw 'Avatar DB check failed.' }
    npx knex migrate:latest
    if ($LASTEXITCODE -ne 0) { throw 'Knex migration failed.' }
} finally { Pop-Location }

Write-Host '[3/5] Installing avatar color metadata...'
$colors = Join-Path $PackageRoot 'Roblox\Roblox.Libraries\Json\avatar-colors.json'
New-Item -ItemType Directory -Force -Path 'C:\app\json' | Out-Null
Copy-Item $colors 'C:\app\json\avatar-colors.json' -Force
Write-Host '  OK C:\app\json\avatar-colors.json'

Write-Host '[4/5] Checking starter assets...'
# Do not use a heredoc here: Windows PowerShell 5.1 parses it differently.
$checkPath = Join-Path $ProjectRoot 'api\check-starter-assets-temp.js'
$check = @(
'const fs = require("fs");',
'const path = require("path");',
'const knexLib = require("knex");',
'const cfg = JSON.parse(fs.readFileSync(path.join(__dirname,"config.json"),"utf8"));',
'const k = cfg.knex || {};',
'const connection = process.env.POSTGRES || k.connection;',
'(async function(){',
'  let db;',
'  try {',
'    if (!connection) throw new Error("No knex connection configured");',
'    db = knexLib({client:k.client || "pg", connection:connection, pool:k.pool});',
'    const ids=[63690008,144076358,144076760];',
'    const rows=await db("asset").select("id").whereIn("id",ids);',
'    const got=new Set(rows.map(r=>Number(r.id)));',
'    ids.forEach(id=>console.log("[StarterAsset] "+id+": "+(got.has(id)?"FOUND":"MISSING")));',
'    await db.destroy();',
'    process.exit(0);',
'  } catch(e) {',
'    if(db){try{await db.destroy();}catch(_){}}',
'    console.error("[StarterAsset] check failed: "+e.message);',
'    process.exit(1);',
'  }',
'})();'
) -join [Environment]::NewLine
Set-Content -Path $checkPath -Value $check -Encoding ASCII
try {
    node $checkPath
    if ($LASTEXITCODE -ne 0) { throw 'Starter asset check failed.' }
} finally { Remove-Item $checkPath -Force -ErrorAction SilentlyContinue }

Write-Host '[5/5] Building Roblox.Website Release...'
$proj = Join-Path $ProjectRoot 'Roblox\Roblox.Website\Roblox.Website.csproj'
dotnet build $proj -c Release --no-restore
if ($LASTEXITCODE -ne 0) { throw 'dotnet build failed.' }

Write-Host ''
Write-Host 'FIX INSTALLED SUCCESSFULLY'
Write-Host ('Backup: ' + $backup)
Write-Host 'Restart Sora and test a new account.'
