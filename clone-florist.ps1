# Clone florist.vn website using PowerShell Invoke-WebRequest

$baseUrl = "https://florist.vn"
$outputDir = "D:\WorkSpace\Ecommerce\florist-mirror"

if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

function Download-Page {
    param([string]$url, [string]$savePath)
    
    try {
        Write-Host "Downloading: $url" -ForegroundColor Cyan
        
        $response = Invoke-WebRequest -Uri $url -UserAgent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" -UseBasicParsing
        
        # Get HTML content
        $html = $response.Content
        
        # Save the page
        $response | Out-File -FilePath $savePath -Encoding UTF8
        
        # Extract links from the page
        $links = [regex]::Matches($html, 'href=["'']([^"'']*)["'']') | ForEach-Object { $_.Groups[1].Value }
        $srcLinks = [regex]::Matches($html, 'src=["'']([^"'']*)["'']') | ForEach-Object { $_.Groups[1].Value }
        
        # Filter internal links
        $allLinks = $links + $srcLinks
        $internalLinks = $allLinks | Where-Object { 
            $_ -and (
                $_.StartsWith('/') -or 
                $_.StartsWith($baseUrl) -or
                ($_ -notmatch '^https?://' -and $_ -notmatch '^//')
            )
        } | ForEach-Object {
            if ($_.StartsWith('/')) {
                return "$baseUrl$_"
            }
            return $_
        } | Sort-Object -Unique
        
        return $internalLinks
    }
    catch {
        Write-Host "Error downloading $url : $_" -ForegroundColor Red
        return @()
    }
}

function Save-Asset {
    param([string]$url, [string]$baseDir)
    
    try {
        $uri = [System.Uri]::new($url)
        $relativePath = $uri.AbsolutePath.TrimStart('/')
        
        if (-not $relativePath -or $relativePath -eq '/') {
            $relativePath = "index.html"
        }
        
        # Clean path
        $relativePath = $relativePath -replace '/+', '/'
        $relativePath = $relativePath -replace '[^a-zA-Z0-9\.\-/]', '_'
        
        $fullPath = Join-Path $baseDir $relativePath
        
        # Create directory if needed
        $dir = Split-Path $fullPath -Parent
        if ($dir -and (-not (Test-Path $dir))) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
        }
        
        if (-not (Test-Path $fullPath)) {
            Write-Host "  Saving: $relativePath" -ForegroundColor Gray
            Invoke-WebRequest -Uri $url -OutFile $fullPath -UserAgent "Mozilla/5.0" -UseBasicParsing -TimeoutSec 30
        }
    }
    catch {
        Write-Host "  Error saving $url : $_" -ForegroundColor Yellow
    }
}

# Start with homepage
$visited = @{}
$toVisit = @($baseUrl + "/")

Write-Host "Starting to clone florist.vn..." -ForegroundColor Green
Write-Host "Output directory: $outputDir" -ForegroundColor Yellow

$count = 0
$maxPages = 50

while ($toVisit.Count -gt 0 -and $count -lt $maxPages) {
    $url = $toVisit[0]
    $toVisit = $toVisit[1..($toVisit.Count-1)]
    
    if ($visited.ContainsKey($url)) {
        continue
    }
    $visited[$url] = $true
    
    $uri = [System.Uri]::new($url)
    $savePath = Join-Path $outputDir $uri.AbsolutePath.TrimStart('/')
    
    if (-not $savePath -or $savePath -eq $outputDir) {
        $savePath = Join-Path $outputDir "index.html"
    }
    
    # Clean path - convert URL path to file system path
    $savePath = $savePath -replace '/', '\'
    $savePath = $savePath.TrimEnd('\')
    
    if (-not $savePath -or $savePath -eq $outputDir -or $savePath.Length -lt 5) {
        $savePath = Join-Path $outputDir "index.html"
    }
    
    # Ensure we have a proper file path
    if (-not $savePath.Contains('.')) {
        $savePath = Join-Path $outputDir "$savePath.html"
    }
    
    $dir = Split-Path $savePath -Parent
    if ($dir -and ($dir.Length -gt 5) -and (-not (Test-Path $dir))) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
    
    $newLinks = Download-Page -url $url -savePath $savePath
    $count++
    
    foreach ($link in $newLinks) {
        if (-not $visited.ContainsKey($link)) {
            $toVisit += $link
        }
    }
    
    Write-Host "Visited: $count | Queue: $($toVisit.Count) | Total: $($visited.Count)" -ForegroundColor Magenta
}

Write-Host "`nDone! Downloaded $count pages to $outputDir" -ForegroundColor Green
