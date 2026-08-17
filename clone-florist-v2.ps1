# Clone florist.vn website - Fixed version

$baseUrl = "https://florist.vn"
$outputDir = "D:\WorkSpace\Ecommerce\florist-mirror"

if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

function Get-SafeFileName {
    param([string]$path)
    $invalid = [System.IO.Path]::GetInvalidFileNameChars()
    foreach ($char in $invalid) {
        $path = $path -replace [regex]::Escape($char), '_'
    }
    # Remove other problematic chars
    $path = $path -replace '[<>:"/\\|?*]', '_'
    return $path
}

function Download-Page {
    param([string]$url, [string]$savePath)
    
    try {
        Write-Host "Downloading: $url" -ForegroundColor Cyan
        
        $response = Invoke-WebRequest -Uri $url -UserAgent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" -UseBasicParsing
        
        # Save the page
        $html = $response.Content
        $response | Out-File -FilePath $savePath -Encoding UTF8
        
        # Extract links
        $linkPattern = 'href=["'']([^"'']*)["'']'
        $srcPattern = 'src=["'']([^"'']*)["'']'
        
        $links = [regex]::Matches($html, $linkPattern) | ForEach-Object { $_.Groups[1].Value }
        $srcLinks = [regex]::Matches($html, $srcPattern) | ForEach-Object { $_.Groups[1].Value }
        
        $allLinks = $links + $srcLinks
        $internalLinks = @()
        
        foreach ($link in $allLinks) {
            if ([string]::IsNullOrEmpty($link)) { continue }
            if ($link -match '^(javascript:|mailto:|tel:|#)') { continue }
            if ($link -match '^data:') { continue }
            
            try {
                $absoluteUrl = $null
                if ($link.StartsWith('http://') -or $link.StartsWith('https://')) {
                    if ($link -match 'florist\.vn') {
                        $absoluteUrl = $link
                    }
                }
                elseif ($link.StartsWith('//')) {
                    $absoluteUrl = "https:$link"
                }
                elseif ($link.StartsWith('/')) {
                    $absoluteUrl = $baseUrl + $link
                }
                else {
                    $absoluteUrl = "$baseUrl/$link"
                }
                
                if ($absoluteUrl -and $absoluteUrl -match 'florist\.vn' -and $absoluteUrl -notmatch '\.(jpg|jpeg|png|gif|css|js|woff|woff2|ttf|eot|svg|ico)($|\?)') {
                    $internalLinks += $absoluteUrl
                }
            }
            catch { }
        }
        
        return ($internalLinks | Select-Object -Unique)
    }
    catch {
        Write-Host "Error downloading $url : $_" -ForegroundColor Red
        return @()
    }
}

function Save-Asset {
    param([string]$url)
    
    try {
        $parsed = [System.Uri]::new($url)
        $relativePath = $parsed.AbsolutePath.TrimStart('/')
        
        if ([string]::IsNullOrEmpty($relativePath) -or $relativePath -eq '/') {
            return
        }
        
        $safePath = Get-SafeFileName -path $relativePath
        $fullPath = Join-Path $outputDir $safePath
        
        $dir = Split-Path $fullPath -Parent
        if ($dir -and (-not (Test-Path $dir))) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
        }
        
        if (-not (Test-Path $fullPath)) {
            Write-Host "  Asset: $safePath" -ForegroundColor Gray
            Invoke-WebRequest -Uri $url -OutFile $fullPath -UserAgent "Mozilla/5.0" -UseBasicParsing -TimeoutSec 30
        }
    }
    catch {
        Write-Host "  Asset error: $url" -ForegroundColor Yellow
    }
}

# Start with homepage
$visited = @{}
$toVisit = @($baseUrl + "/")

Write-Host "Starting to clone florist.vn..." -ForegroundColor Green
Write-Host "Output directory: $outputDir" -ForegroundColor Yellow

$count = 0
$maxPages = 100

while ($toVisit.Count -gt 0 -and $count -lt $maxPages) {
    $url = $toVisit[0]
    $toVisit = $toVisit[1..($toVisit.Count-1)]
    
    if ($visited.ContainsKey($url)) {
        continue
    }
    $visited[$url] = $true
    
    try {
        $parsed = [System.Uri]::new($url)
        $relativePath = $parsed.AbsolutePath.TrimStart('/')
        
        if ([string]::IsNullOrEmpty($relativePath) -or $relativePath -eq '/') {
            $savePath = Join-Path $outputDir "index.html"
        }
        else {
            $safePath = Get-SafeFileName -path $relativePath
            $savePath = Join-Path $outputDir $safePath
        }
        
        # Ensure .html extension for pages without extension
        if (-not $savePath.Contains('.')) {
            $savePath = "$savePath.html"
        }
        
        # Create directory
        $dir = Split-Path $savePath -Parent
        if ($dir -and (-not (Test-Path $dir))) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
        }
        
        $newLinks = Download-Page -url $url -savePath $savePath
        $count++
        
        foreach ($link in $newLinks) {
            if (-not $visited.ContainsKey($link)) {
                $toVisit += $link
            }
        }
        
        Write-Host "Visited: $count | Queue: $($toVisit.Count)" -ForegroundColor Magenta
    }
    catch {
        Write-Host "Error processing $url : $_" -ForegroundColor Red
    }
}

Write-Host "`nDone! Downloaded $count pages" -ForegroundColor Green

# List downloaded files
Write-Host "`nDownloaded files:" -ForegroundColor Yellow
Get-ChildItem -Path $outputDir -Recurse -File | Select-Object FullName, Length | Format-Table -AutoSize
