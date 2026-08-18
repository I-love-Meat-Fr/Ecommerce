# Find image URLs from florist.vn HTML files
$dir = "D:\WorkSpace\Ecommerce\florist-mirror"

Get-ChildItem -Path $dir -Filter "*.html" -Recurse -File | ForEach-Object {
    $content = Get-Content -Path $_.FullName -Raw
    # Find all image src URLs
    [regex]::Matches($content, 'src=["''](https?://[^"'']*?florist\.vn[^"'']*?\.(jpg|jpeg|png|gif|webp))["'']') | ForEach-Object {
        $_.Groups[1].Value
    }
} | Sort-Object -Unique | Select-Object -First 50
