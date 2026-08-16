$ErrorActionPreference = "Stop"

$root = "C:\ProjectSora\pekora-latest-src"
$file = Join-Path $root "Roblox\Roblox.Rendering\RenderingHandler.cs"

if (!(Test-Path -LiteralPath $file)) {
    throw "RenderingHandler.cs not found: $file"
}

$backup = "$file.bak-base64-fix2"
Copy-Item -LiteralPath $file -Destination $backup -Force

$s = [System.IO.File]::ReadAllText($file)

$pattern = '(?ms)(\s*)string\s+base64\s*=\s*\(string\)\(object\)inputImage!\s*;\s*byte\[\]\s+imageBytes\s*=\s*Convert\.FromBase64String\(base64\)\s*;\s*imageStream\s*=\s*new\s+MemoryStream\(imageBytes\)\s*;'

$replacement = @'
            {
                string base64 = NormalizeBase64((string)(object)inputImage!);
                byte[] imageBytes;

                try
                {
                    imageBytes = Convert.FromBase64String(base64);
                }
                catch (FormatException ex)
                {
                    string preview = base64.Length > 160 ? base64.Substring(0, 160) : base64;
                    throw new ArgumentException(
                        $"Renderer returned invalid Base64. Length={base64.Length}; Preview={preview}",
                        ex);
                }

                imageStream = new MemoryStream(imageBytes);
            }
'@

$new = [regex]::Replace($s, $pattern, $replacement, 1)

if ($new -eq $s) {
    Write-Host "PATCH TARGET NOT FOUND."
    Write-Host "Showing matching Base64 lines:"
    Select-String -LiteralPath $file -Pattern "FromBase64String|string base64|imageBytes" | ForEach-Object { Write-Host $_.LineNumber $_.Line }
    throw "No change was made."
}

$s = $new

$marker = '        public static async Task<TReturn> ResizeImage<TReturn, TImageType>'

$helper = @'
        private static string NormalizeBase64(string input)
        {
            if (string.IsNullOrWhiteSpace(input))
                throw new ArgumentException("Renderer returned an empty image.");

            string value = input.Trim();

            if (value.Length >= 2 && value[0] == '"' && value[value.Length - 1] == '"')
            {
                try
                {
                    string? decoded = JsonSerializer.Deserialize<string>(value);
                    if (!string.IsNullOrEmpty(decoded))
                        value = decoded.Trim();
                }
                catch
                {
                }
            }

            int comma = value.IndexOf(',');
            if (value.StartsWith("data:image/", StringComparison.OrdinalIgnoreCase) && comma >= 0)
                value = value.Substring(comma + 1);

            value = new string(value.Where(c => !char.IsWhiteSpace(c)).ToArray());

            return value;
        }

'@

if (!$s.Contains("private static string NormalizeBase64(")) {
    $pos = $s.IndexOf($marker)
    if ($pos -lt 0) {
        throw "ResizeImage marker not found. No change was made."
    }
    $s = $s.Insert($pos, $helper)
}

[System.IO.File]::WriteAllText($file, $s, [System.Text.UTF8Encoding]::new($false))

Write-Host "DONE"
Write-Host "Changed: $file"
Write-Host "Backup : $backup"
