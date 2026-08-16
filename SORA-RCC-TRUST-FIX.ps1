$ErrorActionPreference = "Stop"

$root = "C:\ProjectSora\pekora-latest-src"
$hat = Join-Path $root "RCCService\RCCService2020\internalscripts\thumbnails\Hat.lua"
$app = Join-Path $root "RCCService\RCCService2020\AppSettings.xml"

if (!(Test-Path -LiteralPath $hat)) { throw "Hat.lua not found: $hat" }
if (!(Test-Path -LiteralPath $app)) { throw "AppSettings.xml not found: $app" }

# Find likely local HTTP listeners. We deliberately test the asset endpoint itself.
$ports = @(80, 5000, 7832, 3000, 8080, 8081, 8888)
try {
    $ports += Get-NetTCPConnection -State Listen -ErrorAction Stop |
        Where-Object { $_.LocalAddress -in @("127.0.0.1","0.0.0.0","::","::1") } |
        Select-Object -ExpandProperty LocalPort
} catch {}

$ports = $ports | Sort-Object -Unique

$localBase = $null
foreach ($port in $ports) {
    foreach ($hostName in @("127.0.0.1","localhost")) {
        $url = "http://$hostName`:$port/v1/asset?id=7"
        try {
            $r = Invoke-WebRequest -Uri $url -Method GET -TimeoutSec 3 -UseBasicParsing
            if ($r.StatusCode -ge 200 -and $r.StatusCode -lt 300 -and $r.RawContentLength -gt 0) {
                $localBase = "http://$hostName`:$port"
                break
            }
        } catch {}
    }
    if ($localBase) { break }
}

if (!$localBase) {
    Write-Host ""
    Write-Host "NO LOCAL ASSET ENDPOINT FOUND."
    Write-Host "No file was changed."
    Write-Host ""
    Write-Host "Listening TCP ports detected:"
    $ports | ForEach-Object { Write-Host "  $_" }
    Write-Host ""
    Write-Host "The website service must be running locally before RCC can use the trusted local bridge."
    exit 2
}

$hatBackup = "$hat.bak-local-asset-bridge"
$appBackup = "$app.bak-local-asset-bridge"

Copy-Item -LiteralPath $hat -Destination $hatBackup -Force
Copy-Item -LiteralPath $app -Destination $appBackup -Force

$text = [System.IO.File]::ReadAllText($hat)

# Convert the public Sora asset URL to the local trusted bridge.
$escaped = [regex]::Escape("https://sora-server-1.onrender.com")
$text = [regex]::Replace(
    $text,
    $escaped,
    [System.Text.RegularExpressions.MatchEvaluator]{ param($m) $localBase }
)

# Also force the BaseUrl used by SetBaseUrl() to the local bridge.
# This keeps GetObjects() on the same trusted origin.
$text = [regex]::Replace(
    $text,
    'pcall\(function\(\) game:GetService\("ContentProvider"\):SetBaseUrl\(baseUrl\) end\)',
    "baseUrl = `"$localBase`"`r`npcall(function() game:GetService(`"ContentProvider`"):SetBaseUrl(baseUrl) end)"
)

[System.IO.File]::WriteAllText($hat, $text, [System.Text.UTF8Encoding]::new($false))

$appText = [System.IO.File]::ReadAllText($app)
$appText = [regex]::Replace($appText, '<BaseUrl>.*?</BaseUrl>', "<BaseUrl>$localBase</BaseUrl>")
[System.IO.File]::WriteAllText($app, $appText, [System.Text.UTF8Encoding]::new($false))

Write-Host ""
Write-Host "DONE"
Write-Host "Local trusted asset bridge: $localBase"
Write-Host "Changed: $hat"
Write-Host "Changed: $app"
Write-Host "Backup : $hatBackup"
Write-Host "Backup : $appBackup"
Write-Host ""
Write-Host "Next: restart RCC Catalog and test one Hat render."
