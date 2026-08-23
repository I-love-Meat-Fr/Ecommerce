# Security Headers Test -- Fix #7 Verification
# Verifies that all HTTP security headers are present on API responses.
#
# Usage:
#   .\test-security-headers.ps1                      # defaults to http://localhost:5000
#   .\test-security-headers.ps1 -BaseUrl http://localhost:5000

param(
    [string]$BaseUrl = "http://localhost:5000"
)

$ErrorActionPreference = "Continue"
$HealthUrl = "$BaseUrl/health"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Security Headers Test -- Fix #7" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  Target : $HealthUrl"
Write-Host ""

# Check API is reachable
try {
    $resp = Invoke-WebRequest -Uri $HealthUrl -Method GET -TimeoutSec 5 -ErrorAction SilentlyContinue
    if ($resp.StatusCode -eq 200) {
        Write-Host "[OK] API is reachable" -ForegroundColor Green
    }
} catch {
    Write-Host "[WARN] Could not reach API. Start with: .\run-all.ps1" -ForegroundColor Yellow
    exit 1
}

# Headers we expect (name -> description)
$expected = @{
    "X-Frame-Options"        = "Blocks iframe embedding"
    "X-Content-Type-Options" = "No MIME sniffing"
    "X-XSS-Protection"       = "XSS auditor disabled"
    "Referrer-Policy"        = "No referrer leak"
    "Permissions-Policy"     = "Unused browser APIs disabled"
    "Content-Security-Policy" = "Strict allowlist, no inline scripts"
    "Strict-Transport-Security" = "HTTPS enforced"
}

Write-Host ""
Write-Host "Checking response headers..." -ForegroundColor Yellow
Write-Host ""

$headers = @{}
foreach ($key in $resp.Headers.Keys) {
    $headers[$key] = $resp.Headers[$key]
}

$allPass = $true
foreach ($header in $expected.Keys) {
    if ($headers.ContainsKey($header)) {
        $val = $headers[$header]
        # Truncate long CSP value for display
        $display = if ($val.Length -gt 80) { $val.Substring(0, 80) + "..." } else { $val }
        Write-Host "  [PASS] $header" -ForegroundColor Green
        Write-Host "         $display" -ForegroundColor Gray
    } else {
        Write-Host "  [FAIL] $header -- MISSING" -ForegroundColor Red
        Write-Host "         $($expected[$header])" -ForegroundColor Gray
        $allPass = $false
    }
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "RESULT" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

if ($allPass) {
    Write-Host "  All security headers present!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Full headers received:" -ForegroundColor White
    foreach ($key in $headers.Keys) {
        $val = $headers[$key]
        $display = if ($val.Length -gt 120) { $val.Substring(0, 120) + "..." } else { $val }
        Write-Host "  $key`: $display" -ForegroundColor Gray
    }
    Write-Host ""
    exit 0
} else {
    Write-Host "  Some headers are MISSING. Restart API and retry." -ForegroundColor Red
    Write-Host "  .\run-all.ps1   then re-run this script" -ForegroundColor Yellow
    exit 1
}
