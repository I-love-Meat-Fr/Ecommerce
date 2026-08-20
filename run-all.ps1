# Run both Backend (API) and Frontend simultaneously
# Usage: .\run-all.ps1

$ErrorActionPreference = "Continue"
$ScriptDir = $PSScriptRoot

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Starting Ecommerce Application" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Backend
Write-Host "[1/2] Starting Backend API..." -ForegroundColor Yellow
$BEJob = Start-Job -ScriptBlock {
    Set-Location $using:ScriptDir\api
    dotnet run
}

# Frontend
Write-Host "[2/2] Starting Frontend..." -ForegroundColor Yellow
$FEJob = Start-Job -ScriptBlock {
    Set-Location $using:ScriptDir\frontend
    npm run dev
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "Both services started!" -ForegroundColor Green
Write-Host "  - API:      http://localhost:5000"
Write-Host "  - Swagger:  http://localhost:5000/swagger"
Write-Host "  - Frontend: http://localhost:5173"
Write-Host ""
Write-Host "Press Ctrl+C to stop all services"
Write-Host "=========================================" -ForegroundColor Green

# Wait for jobs
try {
    while ($true) {
        Start-Sleep 1
    }
}
finally {
    Stop-Job -Job $BEJob, $FEJob -ErrorAction SilentlyContinue
    Remove-Job -Job $BEJob, $FEJob -Force -ErrorAction SilentlyContinue
    Write-Host "`nAll services stopped." -ForegroundColor Red
}
