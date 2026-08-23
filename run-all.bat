@echo off
REM Run both Backend (ASP.NET API on :5126) and Frontend (Vite on :5173+).
REM Usage:  run-all.bat          (builds first)
REM         run-all.bat -SkipBuild
REM         run-all.bat /SkipBuild

setlocal EnableDelayedExpansion

set "ROOT=%~dp0"
set "API_DIR=%ROOT%api"
set "FE_DIR=%ROOT%frontend"
set "API_PORT=5126"
set "FE_PORT=5173"
set "SKIP_BUILD="

if /I "%~1"=="-SkipBuild" set "SKIP_BUILD=--no-build"
if /I "%~1"=="/SkipBuild" set "SKIP_BUILD=--no-build"

echo ==========================================
echo  Ecommerce - dev launcher (CMD)
echo ==========================================

REM ---- preflight: dotnet SDK present? ------------------------------------
where dotnet >nul 2>&1
if errorlevel 1 (
    set "DOTNET_EXE=C:\Program Files\dotnet\dotnet.exe"
    if not exist "!DOTNET_EXE!" (
        echo ERROR: dotnet not found on PATH and not at !DOTNET_EXE!
        echo        winget install --id Microsoft.DotNet.SDK.8 -e
        pause & exit /b 1
    )
) else (
    for /f "tokens=*" %%i in ('where dotnet') do (
        set "DOTNET_EXE=%%i"
        goto :dotnet_found
    )
)
:dotnet_found

echo dotnet: !DOTNET_EXE!

!DOTNET_EXE! --info | findstr /R /C:"SDKs installed:" >nul 2>&1
if errorlevel 1 (
    echo ERROR: dotnet found but no SDK installed ^(.NET 6/8/9 runtimes only^).
    echo        winget install --id Microsoft.DotNet.SDK.8 -e
    pause & exit /b 1
)

where npm >nul 2>&1
if errorlevel 1 (
    echo ERROR: npm not on PATH. Install Node.js LTS first.
    pause & exit /b 1
)

if not exist "%API_DIR%\Ecommer.Api.csproj" (
    echo ERROR: api\Ecommer.Api.csproj missing.
    pause & exit /b 1
)
if not exist "%FE_DIR%\package.json" (
    echo ERROR: frontend\package.json missing.
    pause & exit /b 1
)

REM ---- port guard: 5126 ------------------------------------------------
netstat -ano | findstr /R /C:":%API_PORT% .*LISTENING" >nul 2>&1
if not errorlevel 1 (
    echo ERROR: port %API_PORT% already in use. Stop the existing dotnet first:
    echo        Get-Process dotnet ^| Stop-Process -Force
    pause & exit /b 1
)

REM ---- launch backend in its own window ---------------------------------
echo.
echo [1/2] Starting backend on http://localhost:%API_PORT% ...
start "BE - ASP.NET API" cmd /c "cd /d "%API_DIR%" && "!DOTNET_EXE!" run --project "%API_DIR%" --launch-profile http %SKIP_BUILD% & echo. & echo *** BE stopped. Closing window in 10 s *** & timeout /t 10 >nul"

REM ---- launch frontend in its own window -------------------------------
echo [2/2] Starting frontend (Vite) ...
start "FE - Vite" cmd /c "cd /d "%FE_DIR%" && npm run dev & echo. & echo *** FE stopped. Closing window in 10 s *** & timeout /t 10 >nul"

echo.
echo ==========================================
echo  Both services launched in separate windows.
echo    API  -^> http://localhost:%API_PORT%
echo    SPA  -^> http://localhost:%FE_PORT% ^(auto-bump if busy^)
echo.
echo  Closing this launcher will NOT stop them.
echo  To stop them: close the BE / FE windows, or run:
echo      taskkill /F /IM dotnet.exe
echo      taskkill /F /IM node.exe /T
echo ==========================================
echo.
endlocal