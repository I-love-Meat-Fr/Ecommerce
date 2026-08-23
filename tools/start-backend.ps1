# Starts the .NET API background (no PowerShell pipe so dotnet survives),
# loading MONGO_CONNECTION_STRING from .env. Creds are NOT echoed.

[CmdletBinding()]
param(
    [switch]$Foreground
)

$ErrorActionPreference = 'Stop'
$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
Set-Location (Join-Path $repoRoot 'api')

$line = Get-Content (Join-Path $repoRoot '.env') `
    | Where-Object { $_ -match '^MONGO_CONNECTION_STRING=' } `
    | Select-Object -First 1
if (-not $line) { Write-Error "MONGO_CONNECTION_STRING not set in .env"; exit 2 }

# Skip the query string with database name when showing status; do NOT echo the URI.
$env:MONGO_CONNECTION_STRING = ($line -split '=', 2)[1].Trim().Trim('"')
$uriShort = ($env:MONGO_CONNECTION_STRING -split '\?')[0] -replace '//[^@]+@', '//<user>@'
Write-Host "MONGO_CONNECTION_STRING loaded -> $uriShort" -ForegroundColor Cyan

if ($Foreground) {
    & dotnet run --no-launch-profile --urls http://localhost:5126
} else {
    # Use Start-Process so dotnet outlives this script. Redirect logs to a file we can tail.
    $logPath = Join-Path $repoRoot '.logs\backend.log'
    New-Item -ItemType Directory -Path (Split-Path $logPath) -Force | Out-Null
    $proc = Start-Process -FilePath 'dotnet' `
        -ArgumentList @('run','--no-launch-profile','--urls','http://localhost:5126') `
        -RedirectStandardOutput $logPath `
        -RedirectStandardError  "$logPath.err" `
        -WorkingDirectory (Get-Location) `
        -PassThru -WindowStyle Hidden
    Write-Host "Backend PID=$($proc.Id), log=$logPath"
}