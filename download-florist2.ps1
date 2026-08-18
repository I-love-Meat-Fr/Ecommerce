# Re-download florist.vn using WebClient

$baseUrl = "https://florist.vn"
$outputDir = "D:\WorkSpace\Ecommerce\florist-mirror"

if (Test-Path $outputDir) {
    Remove-Item -Path $outputDir -Recurse -Force
}
New-Item -ItemType Directory -Path $outputDir -Force | Out-Null

function Download-Page {
    param($url, $savePath)
    
    try {
        Write-Host "Downloading: $url"
        
        $client = New-Object System.Net.WebClient
        $client.Headers.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        
        # Download as string
        $html = $client.DownloadString($url)
        
        # Save to file
        $client.Dispose()
        
        # Create directory
        $dir = Split-Path $savePath -Parent
        if ($dir -and (-not (Test-Path $dir))) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
        }
        
        # Write with UTF-8 BOM for Vietnamese
        $utf8 = New-Object System.Text.UTF8Encoding $true
        [System.IO.File]::WriteAllText($savePath, $html, $utf8)
        
        Write-Host "  Saved: $savePath"
        
        return $html
    }
    catch {
        Write-Host "  Error: $_" -ForegroundColor Red
        return $null
    }
}

# Start crawling
$visited = @{}
$toVisit = @($baseUrl + "/")

Write-Host "Starting florist.vn clone..." -ForegroundColor Green

$count = 0
$maxPages = 50

while ($toVisit.Count -gt 0 -and $count -lt $maxPages) {
    $url = $toVisit[0]
    $toVisit = $toVisit[1..($toVisit.Count-1)]
    
    if ($visited.ContainsKey($url)) { continue }
    $visited[$url] = $true
    
    # Generate file path
    $parsed = [System.Uri]::new($url)
    $path = $parsed.AbsolutePath.TrimStart('/')
    
    if ([string]::IsNullOrEmpty($path) -or $path -eq '/') {
        $filePath = Join-Path $outputDir "index.html"
    }
    else {
        $filePath = Join-Path $outputDir ($path -replace '/', '\')
    }
    
    if (-not $filePath.Contains('.')) {
        $filePath = "$filePath.html"
    }
    
    $html = Download-Page -url $url -savePath $filePath
    if ($html) {
        $count++
        
        # Extract links
        $links = [regex]::Matches($html, 'href=["'']([^"'']*)["'']') | ForEach-Object { $_.Groups[1].Value }
        
        foreach ($link in $links) {
            if ([string]::IsNullOrEmpty($link)) { continue }
            if ($link -match '^(javascript:|mailto:|tel:|#|data:)') { continue }
            
            $absoluteUrl = $null
            if ($link -match '^https?://') {
                if ($link -match 'florist\.vn') { $absoluteUrl = $link }
            }
            elseif ($link.StartsWith('/')) {
                $absoluteUrl = $baseUrl + $link
            }
            
            if ($absoluteUrl -and -not $visited.ContainsKey($absoluteUrl)) {
                if ($absoluteUrl -notmatch '\.(jpg|jpeg|png|gif|css|js|woff|ttf|svg|ico)($|\?)') {
                    $toVisit += $absoluteUrl
                }
            }
        }
    }
    
    Write-Host "  Queue: $($toVisit.Count) | Total: $($visited.Count)" -ForegroundColor Cyan
}

Write-Host "`nDone! Downloaded $count pages" -ForegroundColor Green
