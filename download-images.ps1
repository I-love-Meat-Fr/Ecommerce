# Download images from florist.vn

$baseUrl = "https://florist.vn"
$outputDir = "D:\WorkSpace\Ecommerce\florist-mirror\assets"

if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

$images = @(
    # Product images from wp-content/uploads
    "https://florist.vn/wp-content/uploads/2020/10/38.png",
    "https://florist.vn/wp-content/uploads/2020/10/40.png",
    "https://florist.vn/wp-content/uploads/2020/10/41.png",
    "https://florist.vn/wp-content/uploads/2020/10/43.png",
    "https://florist.vn/wp-content/uploads/2020/10/44.png",
    "https://florist.vn/wp-content/uploads/2020/10/45.png",
    "https://florist.vn/wp-content/uploads/2020/10/64.png",
    "https://florist.vn/wp-content/uploads/2020/10/74.png",
    "https://florist.vn/wp-content/uploads/2020/10/b1.png",
    "https://florist.vn/wp-content/uploads/2020/10/b2.png",
    # Theme icons
    "https://florist.vn/wp-content/themes/florist/assets/img/109.png",
    "https://florist.vn/wp-content/themes/florist/assets/img/59.png",
    "https://florist.vn/wp-content/themes/florist/assets/img/75.png",
    "https://florist.vn/wp-content/themes/florist/assets/img/76.png",
    "https://florist.vn/wp-content/themes/florist/assets/img/77.png",
    "https://florist.vn/wp-content/themes/florist/assets/img/80.png",
    "https://florist.vn/wp-content/themes/florist/assets/img/81.png",
    "https://florist.vn/wp-content/themes/florist/assets/img/82.png",
    "https://florist.vn/wp-content/themes/florist/assets/img/85.png",
    "https://florist.vn/wp-content/themes/florist/assets/img/86.png",
    "https://florist.vn/wp-content/themes/florist/assets/img/87.png",
    "https://florist.vn/wp-content/themes/florist/assets/img/88.png"
)

Write-Host "Downloading images..." -ForegroundColor Green

foreach ($url in $images) {
    try {
        $fileName = ($url -split '/')[-1]
        $savePath = Join-Path $outputDir $fileName
        
        if (Test-Path $savePath) {
            Write-Host "  Already exists: $fileName" -ForegroundColor Yellow
            continue
        }
        
        $client = New-Object System.Net.WebClient
        $client.Headers.Add("User-Agent", "Mozilla/5.0")
        $client.DownloadFile($url, $savePath)
        $client.Dispose()
        
        $size = (Get-Item $savePath).Length
        Write-Host "  Downloaded: $fileName ($([math]::Round($size/1KB))KB)" -ForegroundColor Green
    }
    catch {
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`nDone!" -ForegroundColor Green
