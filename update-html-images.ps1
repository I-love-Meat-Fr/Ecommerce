# Update HTML files to use local images

$htmlDir = "D:\WorkSpace\Ecommerce\florist-mirror"
$assetsDir = "D:\WorkSpace\Ecommerce\florist-mirror\assets"

Get-ChildItem -Path $htmlDir -Filter "*.html" -File | ForEach-Object {
    $content = Get-Content -Path $_.FullName -Raw
    $original = $content
    
    # Replace florist.vn image URLs with local assets
    $content = $content -replace 'https://florist\.vn/wp-content/uploads/', 'assets/'
    $content = $content -replace 'https://florist\.vn/wp-content/themes/florist/assets/img/', 'assets/'
    
    if ($content -ne $original) {
        $content | Out-File -FilePath $_.FullName -Encoding UTF8 -NoNewline
        Write-Host "Updated: $($_.Name)" -ForegroundColor Green
    }
}

Write-Host "`nDone!" -ForegroundColor Green
