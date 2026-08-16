$ErrorActionPreference = "Stop"

$root = "C:\ProjectSora\pekora-latest-src"
$file = Join-Path $root "Roblox\Roblox.Services\Users\Avatar.cs"

if (-not (Test-Path -LiteralPath $file)) {
    throw "Avatar.cs was not found: $file"
}

$text = [System.IO.File]::ReadAllText($file)

if ($text.Contains('string thumbnail3DDirectory = Path.Combine(Configuration.ThumbnailsDirectory, "3d");')) {
    Write-Host "3D thumbnail directory fix is already present."
    exit 0
}

$marker = '            using SHA256 hasher = SHA256.Create();'
$pos = $text.IndexOf($marker, [System.StringComparison]::Ordinal)

if ($pos -lt 0) {
    throw "Could not find the 3D thumbnail marker in Avatar.cs. No changes were made."
}

$backup = "$file.bak-3d-folder"
Copy-Item -LiteralPath $file -Destination $backup -Force

$insert = @"
            string thumbnail3DDirectory = Path.Combine(Configuration.ThumbnailsDirectory, "3d");
            Directory.CreateDirectory(thumbnail3DDirectory);

"@

$text = $text.Substring(0, $pos) + $insert + $text.Substring($pos)
[System.IO.File]::WriteAllText($file, $text, [System.Text.UTF8Encoding]::new($false))

Write-Host ""
Write-Host "DONE"
Write-Host "Changed: $file"
Write-Host "Backup : $backup"
Write-Host ""
Write-Host "The 3D thumbnail directory will now be created automatically."
