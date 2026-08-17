# Convert PowerShell objects to clean HTML files

$outputDir = "D:\WorkSpace\Ecommerce\florist-mirror"

# Get all files that look like HTML response objects
Get-ChildItem -Path $outputDir -Filter "*.html" -File | ForEach-Object {
    $file = $_
    $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
    
    # Check if it's a PowerShell object format (has StatusCode/Content pattern)
    if ($content -match 'StatusCode\s*:\s*200' -or $content -match 'StatusDescription\s*:') {
        # Extract just the HTML content between the Content field
        if ($content -match '(?s)Content\s*:\s*(\s*<!DOCTYPE.*?)(?=\r?\nRawContent\s*:|\Z)') {
            $html = $matches[1].Trim()
            
            # Clean up PowerShell indentation
            $html = $html -replace '(?m)^                    ', ''
            
            # Save clean HTML
            $html | Out-File -FilePath $file.FullName -Encoding UTF8 -NoNewline
            Write-Host "Fixed: $($file.Name)" -ForegroundColor Green
        }
        elseif ($content -match '(?s)Content\s*:\s*(\s*<.*?)(?=\r?\nRawContent\s*:|\Z)') {
            $html = $matches[1].Trim()
            $html = $html -replace '(?m)^                    ', ''
            $html | Out-File -FilePath $file.FullName -Encoding UTF8 -NoNewline
            Write-Host "Fixed: $($file.Name)" -ForegroundColor Green
        }
    }
}

Write-Host "`nDone!" -ForegroundColor Yellow
