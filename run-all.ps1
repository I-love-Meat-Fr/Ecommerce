#Requires -Version 5.1
<#
.SYNOPSIS
    Start ASP.NET API + Vite dev server together.

.DESCRIPTION
    Single-command dev launcher for the Ecommerce repo:
      * Backend  -> http://localhost:5126  (launchSettings.json profile `http`)
      * Frontend -> http://localhost:5173  (auto-bumps if busy)

    Both processes are background jobs; this script keeps streaming both logs to
    the console until Ctrl+C, at which point it cleans up the full process tree
    (dotnet + node + their children) so nothing dangles.

.EXAMPLE
    .\run-all.ps1
.EXAMPLE
    .\run-all.ps1 -SkipBuild   # dotnet run --no-build + vite, faster restarts
#>

[CmdletBinding()]
param(
    [switch]$SkipBuild
)

$ErrorActionPreference = 'Continue'
$Root    = $PSScriptRoot
$ApiDir  = Join-Path $Root 'api'
$FeDir   = Join-Path $Root 'frontend'
$ApiPort = 5126
$FePort  = 5173

# ---- preflight ----------------------------------------------------------

function Find-Dotnet {
    $envRoot = $env:DOTNET_ROOT
    if ($envRoot -and (Test-Path (Join-Path $envRoot 'dotnet.exe'))) {
        return (Join-Path $envRoot 'dotnet.exe')
    }
    $cmd = Get-Command dotnet -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }
    $known = 'C:\Program Files\dotnet\dotnet.exe'
    if (Test-Path $known) { return $known }
    return $null
}

function Test-SdkInstalled {
    param([string]$DotnetExe)
    $info = & $DotnetExe --info 2>&1 | Out-String
    $hasVer = [regex]::IsMatch($info, '(?m)^\s*Version:\s*\d+\.\d+\.\d+')
    $hasHdr = $info.Contains('SDKs installed:')
    return ($hasVer -and $hasHdr)
}

function Test-PortFree {
    param([int]$Port)
    try {
        $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)
        $listener.Start()
        $listener.Stop()
        return $true
    } catch {
        return $false
    }
}

$dotnet = Find-Dotnet
$npm    = Get-Command npm -ErrorAction SilentlyContinue

Write-Host '==========================================' -ForegroundColor Cyan
Write-Host ' Ecommerce - dev launcher' -ForegroundColor Cyan
Write-Host '==========================================' -ForegroundColor Cyan

if (-not $dotnet) {
    Write-Host 'ERROR: dotnet executable not found.' -ForegroundColor Red
    Write-Host '       Install .NET 8 SDK:' -ForegroundColor Red
    Write-Host '         winget install --id Microsoft.DotNet.SDK.8 -e' -ForegroundColor Red
    exit 1
}
Write-Host ('dotnet : {0}' -f $dotnet) -ForegroundColor DarkGray

if (-not (Test-SdkInstalled -DotnetExe $dotnet)) {
    Write-Host 'ERROR: dotnet found but NO .NET SDK is installed (only runtimes).' -ForegroundColor Red
    Write-Host '       Install the SDK so the API project can build.' -ForegroundColor Red
    Write-Host '         winget install --id Microsoft.DotNet.SDK.8 -e' -ForegroundColor Red
    exit 1
}
if (-not $npm) {
    Write-Host 'ERROR: npm not on PATH. Install Node.js LTS first.' -ForegroundColor Red
    exit 1
}
Write-Host ('npm    : {0}' -f $npm.Source) -ForegroundColor DarkGray

if (-not (Test-Path (Join-Path $ApiDir 'Ecommer.Api.csproj'))) {
    Write-Host 'ERROR: api/Ecommer.Api.csproj missing under the repo root.' -ForegroundColor Red
    exit 1
}
if (-not (Test-Path (Join-Path $FeDir 'package.json'))) {
    Write-Host 'ERROR: frontend/package.json missing under the repo root.' -ForegroundColor Red
    exit 1
}

# ---- port guard ---------------------------------------------------------
if (Test-PortFree -Port $ApiPort) {
    Write-Host ('BE port {0} is free.' -f $ApiPort) -ForegroundColor DarkGreen
} else {
    Write-Host ('BE port {0} already in use. Aborting.' -f $ApiPort) -ForegroundColor Red
    Write-Host '  Stop it first:  Get-Process dotnet | Stop-Process -Force' -ForegroundColor Yellow
    exit 1
}

# ---- launch backend -----------------------------------------------------
# `dotnet run --project` from inside a PS background job is unreliable on
# Windows (the child dotnet process loses its TTY and exits silently).
# Build once, then exec the produced DLL directly. This is faster and
# behaves identically: same Kestrel binding, same env vars, same launchSettings.
$apiDll = Join-Path $ApiDir 'bin\Debug\net8.0\Ecommer.Api.dll'
if (-not (Test-Path $apiDll) -or -not $SkipBuild) {
    Write-Host '       Building API (first run may take ~30 s)...' -ForegroundColor DarkGray
    & $dotnet build $ApiDir -v minimal | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host 'ERROR: dotnet build failed. See output above.' -ForegroundColor Red
        exit 1
    }
}

# Two env tricks required when we exec the DLL directly (bypassing `dotnet run`):
#   1. ASPNETCORE_ENVIRONMENT=Development so appsettings.Development.json loads.
#   2. The job's working directory must be the project dir, otherwise
#      WebApplication.CreateBuilder cannot locate appsettings.json.
$beEnv = @{
    ASPNETCORE_ENVIRONMENT = 'Development'
    DOTNET_CLI_HOME        = $ApiDir
}

# Forward any JWT_* vars the user has set in their shell, otherwise the app
# falls back to Jwt:Secret in appsettings.json.
foreach ($key in @('JWT_SECRET','JWT_ISSUER','JWT_AUDIENCE')) {
    $val = [Environment]::GetEnvironmentVariable($key)
    if ($val) { $beEnv[$key] = $val }
}

Write-Host ''
Write-Host ('[1/2] Starting backend API on http://localhost:{0} ...' -f $ApiPort) -ForegroundColor Yellow

$beJob = Start-Job -Name 'Backend' -ArgumentList $dotnet, $apiDll, $ApiPort, $beEnv, $ApiDir -ScriptBlock {
    param($DotnetExe, $Dll, $Port, $EnvBlock, $ApiDir)
    Set-Location $ApiDir
    foreach ($k in $EnvBlock.Keys) { Set-Item -Path "Env:$k" -Value $EnvBlock[$k] }
    & $DotnetExe exec $Dll --urls ('http://localhost:{0}' -f $Port) 2>&1
}

# ---- launch frontend ----------------------------------------------------
Write-Host '[2/2] Starting frontend (Vite) ...' -ForegroundColor Yellow

$feJob = Start-Job -Name 'Frontend' -ArgumentList $npm.Source, $FeDir -ScriptBlock {
    param($Npm, $FeDir)
    Set-Location $FeDir
    & $Npm run dev 2>&1
}

# ---- cleanup helper -----------------------------------------------------
function Stop-Tree {
    $procs = Get-Process -ErrorAction SilentlyContinue | Where-Object {
        $_.ProcessName -in @('dotnet','node')
    }
    foreach ($p in $procs) {
        try {
            $cmd = (Get-CimInstance Win32_Process -Filter ('ProcessId = {0}' -f $p.Id) -ErrorAction SilentlyContinue).CommandLine
            if ($cmd -and $cmd.Contains($Root)) {
                Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue
            }
        } catch { }
    }
    Stop-Job  -Job $beJob, $feJob -ErrorAction SilentlyContinue
    Remove-Job -Job $beJob, $feJob -Force -ErrorAction SilentlyContinue
}

Write-Host ''
Write-Host '==========================================' -ForegroundColor Green
Write-Host ' Both services starting' -ForegroundColor Green
Write-Host ('   API  -> http://localhost:{0}' -f $ApiPort) -ForegroundColor Green
Write-Host ('   SPA  -> http://localhost:{0} (auto-bump if busy)' -f $FePort) -ForegroundColor Green
Write-Host ' Press Ctrl+C to stop everything (kills full dotnet+node tree)' -ForegroundColor Green
Write-Host '==========================================' -ForegroundColor Green
Write-Host ''

# ---- main loop: tail both logs until a job dies or Ctrl+C ---------------
$startTime = [DateTime]::UtcNow
$maxRunSeconds = 14400   # 4 h safety net

try {
    while ($beJob.State -eq 'Running' -or $feJob.State -eq 'Running') {
        foreach ($j in @($beJob, $feJob)) {
            if ($j.State -ne 'Running') { continue }
            $output = Receive-Job -Job $j 2>&1 | Where-Object { $_ -ne '' }
            $prefix = if ($j.Name -eq 'Backend') { 'BE' } else { 'FE' }
            $color  = if ($j.Name -eq 'Backend') { 'DarkYellow' } else { 'Cyan' }
            foreach ($line in $output) {
                Write-Host ('[{0}] {1}' -f $prefix, $line) -ForegroundColor $color
            }
        }
        Start-Sleep -Milliseconds 250

        $elapsed = ([DateTime]::UtcNow - $startTime).TotalSeconds
        if ($elapsed -gt $maxRunSeconds) {
            Write-Host ('Reached {0} s safety timeout. Cleaning up...' -f $maxRunSeconds) -ForegroundColor Yellow
            break
        }
        if ($beJob.State -eq 'Failed' -or $feJob.State -eq 'Failed') {
            Write-Host 'A process crashed. See logs above. Cleaning up...' -ForegroundColor Red
            break
        }
    }
}
finally {
    Stop-Tree
    Write-Host 'All services stopped.' -ForegroundColor Red
}