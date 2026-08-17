# Re-download florist.vn with clean HTML output

$baseUrl = "https://florist.vn"
$outputDir = "D:\WorkSpace\Ecommerce\florist-mirror"

if (Test-Path $outputDir) {
    Remove-Item -Path $outputDir -Recurse -Force
}
New-Item -ItemType Directory -Path $outputDir -Force | Out-Null

$visited = @{}
$toVisit = @($baseUrl + "/")

Write-Host "Downloading florist.vn..." -ForegroundColor Green
$count = 0
$maxPages = 80

while ($toVisit.Count -gt 0 -and $count -lt $maxPages) {
    $url = $toVisit[0]
    $toVisit = $toVisit[1..($toVisit.Count-1)]
    
    if ($visited.ContainsKey($url)) { continue }
    $visited[$url] = $true
    
    try {
        Write-Host "Downloading: $url"
        
        # Download raw bytes and save directly
        $response = Invoke-WebRequest -Uri $url -UserAgent "Mozilla/5.0" -TimeoutSec 30
        
        # Save response content directly (binary-safe)
        $parsed = [System.Uri]::new($url)
        $path = $parsed.AbsolutePath.TrimStart('/')
        
        if ([string]::IsNullOrEmpty($path) -or $path -eq '/') {
            $filePath = Join-Path $outputDir "index.html"
        }
        else {
            # Convert URL path to file path
            $filePath = Join-Path $outputDir ($path -replace '/', '\')
        }
        
        # Add .html if no extension
        if (-not $filePath.Contains('.')) {
            $filePath = "$filePath.html"
        }
        
        # Create directory
        $dir = Split-Path $filePath -Parent
        if ($dir -and (-not (Test-Path $dir))) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
        }
        
        # Write content as bytes to preserve encoding
        [System.IO.File]::WriteAllBytes($filePath, [System.Text.Encoding]::UTF8.GetBytes($response.Content))
        
        $count++
        
        # Extract internal links for further crawling
        $html = $response.Content
        $linkMatches = [regex]::Matches($html, 'href=["'']([^"'']*)["'']')
        
        foreach ($match in $linkMatches) {
            $link = $match.Groups[1].Value
            if ([string]::IsNullOrEmpty($link)) { continue }
            if ($link -match '^(javascript:|mailto:|tel:|#|data:)') { continue }
            
            try {
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
            catch { }
        }
        
        Write-Host "  ($count saved, $($toVisit.Count) in queue)"
    }
    catch {
        Write-Host "Error: $_" -ForegroundColor Red
    }
}

Write-Host "`nDone! Downloaded $count pages" -ForegroundColor Green

# Show summary
Get-ChildItem -Path $outputDir -File | Measure-Object -Property Length -Sum | ForEach-Object {
    Write-Host "Total files: $($_.Count), Total size: $([math]::Round($_.Sum/1KB)) KB"
}
