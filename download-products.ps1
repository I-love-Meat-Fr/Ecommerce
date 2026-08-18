# Find product images from HTML
$dir = "D:\WorkSpace\Ecommerce\florist-mirror"

# Get all unique image URLs from HTML files
$allImages = @{}

Get-ChildItem -Path $dir -Filter "*.html" -Recurse -File | ForEach-Object {
    $content = Get-Content -Path $_.FullName -Raw
    [regex]::Matches($content, 'src=["'']([^"'']*)["'']') | ForEach-Object {
        $url = $_.Groups[1].Value
        if ($url -match 'wp-content/uploads' -and $url -match '\.(jpg|jpeg|png|webp)') {
            $allImages[$url] = $true
        }
    }
}

Write-Host "Found $($allImages.Count) product images"

# Download
$outputDir = "D:\WorkSpace\Ecommerce\florist-mirror\assets"
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

$count = 0
foreach ($url in $allImages.Keys) {
    try {
        $fileName = ($url -split '/')[-1]
        $fileName = $fileName -replace '\?.*', ''
        $savePath = Join-Path $outputDir $fileName
        
        if ((Test-Path $savePath) -and (Get-Item $savePath).Length -gt 100) {
            continue
        }
        
        $client = New-Object System.Net.WebClient
        $client.Headers.Add("User-Agent", "Mozilla/5.0")
        $client.DownloadFile($url, $savePath)
        $client.Dispose()
        
        $count++
        $size = (Get-Item $savePath).Length
        if ($size -gt 1000) {
            Write-Host "  [$count] $fileName ($([math]::Round($size/1KB))KB)"
        }
    }
    catch { }
}

Write-Host "`nTotal downloaded: $count images"
