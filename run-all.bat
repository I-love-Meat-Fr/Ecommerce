@echo off
REM Run both Backend (API) and Frontend simultaneously
REM Usage: run-all.bat

echo =========================================
echo Starting Ecommerce Application
echo =========================================
echo.

REM Store PIDs for cleanup
set BE_PID=
set FE_PID=

REM Backend
echo [1/2] Starting Backend API...
cd /d "%~dp0api"
start "Backend API" cmd /c "dotnet run & pause"

REM Frontend
echo [2/2] Starting Frontend...
cd /d "%~dp0frontend"
start "Frontend" cmd /c "npm run dev"

echo.
echo =========================================
echo Both services started!
echo   - API:      http://localhost:5000
echo   - Swagger:  http://localhost:5000/swagger
echo   - Frontend: http://localhost:5173
echo =========================================
echo Press any key to exit this window (services keep running)
echo.

pause
