@echo off
title Sora RCC Launcher
cd /d C:\ProjectSora\pekora-latest-src\RCCService\RCCService2020

echo ========================================
echo        SORA RCC LAUNCHER
echo ========================================
echo.

echo [1/4] Starting Player Render : 1621
start "RCC Player Render - 1621" cmd /k "cd /d C:\ProjectSora\pekora-latest-src\RCCService\RCCService2020 && RCCPlayerRender.bat"

echo [2/4] Starting Image Render  : 2621
start "RCC Image Render - 2621" cmd /k "cd /d C:\ProjectSora\pekora-latest-src\RCCService\RCCService2020 && RCCImageRender.bat"

echo [3/4] Starting Game Render   : 3621
start "RCC Game Render - 3621" cmd /k "cd /d C:\ProjectSora\pekora-latest-src\RCCService\RCCService2020 && RCCGameRender.bat"

echo [4/4] Starting Catalog Render: 4621
start "RCC Catalog Render - 4621" cmd /k "cd /d C:\ProjectSora\pekora-latest-src\RCCService\RCCService2020 && RCCCatalogRender.bat"

echo.
echo Waiting for RCC services...
timeout /t 8 /nobreak >nul

echo.
echo Checking ports...
powershell -NoProfile -Command "$ports=1621,2621,3621,4621; foreach($p in $ports){$x=Test-NetConnection 127.0.0.1 -Port $p -WarningAction SilentlyContinue; Write-Host ('Port '+$p+': '+$x.TcpTestSucceeded)}"

echo.
echo ========================================
echo RCC START COMPLETE
echo ========================================
echo.
pause