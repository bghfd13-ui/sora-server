$ErrorActionPreference = "Stop"

$root = "C:\ProjectSora\pekora-latest-src"
$file = Join-Path $root "game-renderer\scripts\Hat.json"

if (-not (Test-Path -LiteralPath $file)) {
    throw "Hat.json was not found: $file"
}

$text = [System.IO.File]::ReadAllText($file)

$old = '"https://www.silrev.biz"'
$new = '"baseUrl"'

if ($text.Contains($new) -and -not $text.Contains($old)) {
    Write-Host "Hat.json is already fixed."
    exit 0
}

if (-not $text.Contains($old)) {
    throw "The expected silrev.biz URL was not found. No changes were made."
}

$backup = "$file.bak-baseurl-fix"
Copy-Item -LiteralPath $file -Destination $backup -Force

$text = $text.Replace($old, $new)
[System.IO.File]::WriteAllText($file, $text, [System.Text.UTF8Encoding]::new($false))

Write-Host ""
Write-Host "DONE"
Write-Host "Changed: $file"
Write-Host "Backup : $backup"
Write-Host ""
Write-Host "Hat.json now uses the renderer-provided baseUrl."
