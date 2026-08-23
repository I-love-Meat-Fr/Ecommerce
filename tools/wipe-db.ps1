# Wipes the target MongoDB database so the API's seeders can repopulate it on next start.
#
# Usage:
#   .\tools\wipe-db.ps1                       # uses MONGO_CONNECTION_STRING env var or default in .env
#   .\tools\wipe-db.ps1 -Uri "<your uri>"     # explicit URI
#
# This script requires the MongoDB.Driver (already in api/) plus a small dotnet host.
# It does NOT shell out to mongosh / mongodump.

[CmdletBinding()]
param(
    [string]$Uri,
    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
Set-Location $repoRoot

# Load URI: explicit > MONGO_CONNECTION_STRING env > appsettings fallback
if (-not $Uri) {
    if ($env:MONGO_CONNECTION_STRING) {
        $Uri = $env:MONGO_CONNECTION_STRING
    } elseif (Test-Path '.env') {
        # Naive parse for MONGO_CONNECTION_STRING=...
        $line = Get-Content '.env' | Where-Object { $_ -match '^MONGO_CONNECTION_STRING=' } | Select-Object -First 1
        if ($line) {
            $Uri = ($line -split '=', 2)[1].Trim().Trim('"')
        }
    }
}

if (-not $Uri) {
    Write-Error "No connection string. Set MONGO_CONNECTION_STRING or pass -Uri."
    exit 2
}

Write-Host "Target URI: $Uri" -ForegroundColor Cyan
Write-Host "Database  : ecommer"
if ($DryRun) {
    Write-Host "[DryRun] No changes made." -ForegroundColor Yellow
    exit 0
}

# Run a tiny C# program against the same driver already in the project.
$csprojDir = Join-Path $repoRoot 'api'
$driverDir = Join-Path $csprojDir 'Drivers'
$dbName = 'ecommer'

$dotnetDir = Join-Path $env:TEMP "wipe-db-$([guid]::NewGuid())"
New-Item -ItemType Directory -Path $dotnetDir -Force | Out-Null

try {
    Set-Location $dotnetDir
    dotnet new console -o . --force --no-restore 2>&1 | Out-Null
    dotnet add package MongoDB.Driver --version 2.28.0 --no-restore 2>&1 | Out-Null
    dotnet restore 2>&1 | Out-Null

    @"
using System;
using MongoDB.Driver;
using MongoDB.Bson;

class Program {
    static int Main(string[] args) {
        var uri = args[0];
        var db  = args[1];
        var settings = MongoClientSettings.FromConnectionString(uri);
        settings.ServerSelectionTimeout = TimeSpan.FromSeconds(10);
        if (uri.StartsWith("mongodb+srv://", StringComparison.OrdinalIgnoreCase)) {
            settings.UseTls = true;
        }
        var client = new MongoClient(settings);
        try {
            client.GetDatabase(db).RunCommand<BsonDocument>(new BsonDocument("ping", 1));
            client.DropDatabase(db);
            Console.WriteLine($"Dropped database '{db}'.");
            return 0;
        } catch (Exception ex) {
            Console.Error.WriteLine($"Failed: {ex.Message}");
            return 1;
        }
    }
}
"@ | Set-Content -Path 'Program.cs' -Encoding UTF8

    dotnet run --no-restore -- "$Uri" $dbName
    exit $LASTEXITCODE
} finally {
    Set-Location $repoRoot
    Remove-Item -Recurse -Force $dotnetDir -ErrorAction SilentlyContinue
}