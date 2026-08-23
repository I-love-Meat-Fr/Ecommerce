param(
    [string]$Uri,
    [string]$Db = 'ecommer'
)

$ErrorActionPreference = 'Stop'
$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')

if (-not $Uri) {
    if ($env:MONGO_CONNECTION_STRING) {
        $Uri = $env:MONGO_CONNECTION_STRING
    } elseif (Test-Path (Join-Path $repoRoot '.env')) {
        $line = Get-Content (Join-Path $repoRoot '.env') | Where-Object { $_ -match '^MONGO_CONNECTION_STRING=' } | Select-Object -First 1
        if ($line) { $Uri = ($line -split '=', 2)[1].Trim().Trim('"') }
    }
}
if (-not $Uri) { Write-Error "No connection string. Pass -Uri or set MONGO_CONNECTION_STRING."; exit 2 }

$tmp = Join-Path $env:TEMP "probe-db-$([guid]::NewGuid())"
New-Item -ItemType Directory -Path $tmp -Force | Out-Null
try {
    Set-Location $tmp
    dotnet new console -o . --force --no-restore 2>&1 | Out-Null
    dotnet add package MongoDB.Driver --version 2.28.0 --no-restore 2>&1 | Out-Null
    dotnet restore 2>&1 | Out-Null
    @"
using System;
using MongoDB.Driver;
class Program {
    static int Main(string[] args) {
        var uri = args[0]; var db = args[1];
        var s = MongoClientSettings.FromConnectionString(uri);
        s.ServerSelectionTimeout = TimeSpan.FromSeconds(10);
        if (uri.StartsWith("mongodb+srv://", StringComparison.OrdinalIgnoreCase)) s.UseTls = true;
        var c = new MongoClient(s);
        var names = c.GetDatabase(db).ListCollectionNames().ToList();
        Console.WriteLine($"Database: {db}");
        Console.WriteLine($"Collections: {(names.Count == 0 ? "(none)" : string.Join(", ", names))}");
        foreach (var n in names) {
            var count = c.GetDatabase(db).GetCollection<MongoDB.Bson.BsonDocument>(n).CountDocuments(MongoDB.Driver.FilterDefinition<MongoDB.Bson.BsonDocument>.Empty);
            Console.WriteLine($"  {n}: {count} docs");
        }
        return 0;
    }
}
"@ | Set-Content Program.cs
    dotnet run --no-restore -- "$Uri" $Db
} finally {
    Set-Location $repoRoot
    Remove-Item -Recurse -Force $tmp -ErrorAction SilentlyContinue
}