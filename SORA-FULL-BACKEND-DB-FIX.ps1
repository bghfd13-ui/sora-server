$ErrorActionPreference = "Stop"
$root="C:\ProjectSora\pekora-latest-src"
$website="$root\Roblox\Roblox.Website"
$appsettings="$website\appsettings.json"
$release="$website\bin\Release\net8.0"
$keys="$release\Keys"

Write-Host "=== SORA BACKEND + DATABASE FIX ===" -ForegroundColor Cyan

if (!(Test-Path $appsettings)) { throw "appsettings.json not found" }

Get-Process dotnet -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep 1

New-Item -ItemType Directory -Force $keys | Out-Null
if (Test-Path "$website\Keys") { Copy-Item "$website\Keys\*" $keys -Force -ErrorAction SilentlyContinue }

$config=Get-Content $appsettings -Raw | ConvertFrom-Json
$cs=[string]$config.Postgres
if ([string]::IsNullOrWhiteSpace($cs)) { throw "Postgres connection string missing" }

$npgsql="$release\Npgsql.dll"
if (!(Test-Path $npgsql)) { throw "Npgsql.dll not found: $npgsql" }

$tmp="$env:TEMP\SoraDbRepair"
Remove-Item $tmp -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force $tmp | Out-Null

@'
using System;
using Npgsql;
class Program {
 static int Main() {
  var cs=Environment.GetEnvironmentVariable("SORA_PG");
  using var con=new NpgsqlConnection(cs);
  con.Open();
  Console.WriteLine("PostgreSQL: CONNECTED");
  using var check=new NpgsqlCommand(@"SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='asset_place'
    AND column_name='roblox_place_id');",con);
  bool exists=(bool)check.ExecuteScalar();
  Console.WriteLine("asset_place.roblox_place_id: "+exists);
  if(!exists) {
   using var alter=new NpgsqlCommand(
    "ALTER TABLE public.asset_place ADD COLUMN roblox_place_id BIGINT NULL;",con);
   alter.ExecuteNonQuery();
   Console.WriteLine("FIXED: added asset_place.roblox_place_id BIGINT NULL");
  }
  return 0;
 }
}
'@ | Set-Content "$tmp\Program.cs" -Encoding UTF8

@"
<Project Sdk="Microsoft.NET.Sdk">
<PropertyGroup><OutputType>Exe</OutputType><TargetFramework>net8.0</TargetFramework></PropertyGroup>
<ItemGroup><Reference Include="Npgsql"><HintPath>$npgsql</HintPath></Reference></ItemGroup>
</Project>
"@ | Set-Content "$tmp\SoraDbRepair.csproj" -Encoding UTF8

$env:SORA_PG=$cs
dotnet run --project "$tmp\SoraDbRepair.csproj"
if($LASTEXITCODE -ne 0){throw "Database repair failed."}

$env:FRONTEND_URL="http://127.0.0.1:3000"
$logDir="C:\ProjectSora\logs"
New-Item -ItemType Directory -Force $logDir | Out-Null
$out="$logDir\backend-manual-fix.log"
$err="$logDir\backend-manual-fix-error.log"
Remove-Item $out,$err -Force -ErrorAction SilentlyContinue

Start-Process dotnet.exe -ArgumentList "run --configuration Release" -WorkingDirectory $website -WindowStyle Hidden -RedirectStandardOutput $out -RedirectStandardError $err

$ready=$false
for($i=0;$i-lt 45;$i++){ Start-Sleep 1; try { if(Get-NetTCPConnection -LocalPort 5000 -State Listen -ErrorAction Stop){$ready=$true;break} }catch{} }

if($ready){
 Write-Host "BACKEND :5000 ONLINE" -ForegroundColor Green
 try{
  $r=Invoke-WebRequest -Uri "http://127.0.0.1:5000/v1/asset?id=7" -TimeoutSec 15 -UseBasicParsing
  Write-Host "HTTP: $($r.StatusCode)" -ForegroundColor Green
  Write-Host "Content-Type: $($r.Headers["Content-Type"])"
  Write-Host "Length: $($r.RawContentLength)"
 }catch{
  Write-Host "Asset endpoint error:" -ForegroundColor Yellow
  Write-Host $_.Exception.Message
  if(Test-Path $err){Get-Content $err -Tail 60}
 }
}else{
 Write-Host "BACKEND DID NOT START ON :5000" -ForegroundColor Red
 if(Test-Path $err){Get-Content $err -Tail 100}
 if(Test-Path $out){Get-Content $out -Tail 100}
 exit 3
}
Write-Host "Done. RCC/renderer were not modified." -ForegroundColor Cyan
