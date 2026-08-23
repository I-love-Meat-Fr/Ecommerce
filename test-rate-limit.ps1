# Rate Limit Test -- Fix #5 Verification
# Clicks POST /api/auth/login 6 times from the same IP.
# Expects: 200/401 for attempts 1-5, then 429 Too Many Requests for attempt 6.
#
# Usage:
#   .\test-rate-limit.ps1                    # defaults to http://localhost:5000
#   .\test-rate-limit.ps1 -BaseUrl http://localhost:5000

param(
    [string]$BaseUrl = "http://localhost:5000",
    [int]$Attempts = 6,
    [string]$Email = "ratelimit-test@nocare.local",
    [string]$Password = "fakepassword123"
)

$ErrorActionPreference = "Continue"
$LoginUrl = "$BaseUrl/api/auth/login"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Rate Limit Test -- Fix #5" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  Target : $LoginUrl"
Write-Host "  Policy : 5 attempts / IP / minute"
Write-Host "  Email  : $Email"
Write-Host "  Pass   : (hidden)"
Write-Host ""

# Warm up -- make sure API is reachable
try {
    $warmup = Invoke-WebRequest -Uri "$BaseUrl/swagger/index.html" -Method GET -TimeoutSec 3 -ErrorAction SilentlyContinue
    if ($warmup.StatusCode -eq 200) {
        Write-Host "[OK] API is reachable" -ForegroundColor Green
    }
} catch {
    Write-Host "[WARN] Could not reach Swagger. API may not be running." -ForegroundColor Yellow
    Write-Host "       Start with: .\run-all.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Running $Attempts login attempts..." -ForegroundColor Yellow
Write-Host ""

$body = @{
    email    = $Email
    password = $Password
} | ConvertTo-Json

$results = @()
$429_hit = $false

for ($i = 1; $i -le $Attempts; $i++) {
    $start = Get-Date
    try {
        $resp = Invoke-WebRequest -Uri $LoginUrl `
            -Method POST `
            -ContentType "application/json" `
            -Body $body `
            -TimeoutSec 10 `
            -ErrorAction SilentlyContinue
        $status = [int]$resp.StatusCode
        $elapsed = ((Get-Date) - $start).TotalMilliseconds
        $results += [PSCustomObject]@{
            Attempt = $i
            Status  = $status
            Elapsed_ms = [math]::Round($elapsed, 0)
            Ok      = $true
        }
        $color = if ($status -eq 429) { "Red" } elseif ($status -eq 200 -or $status -eq 401) { "White" } else { "Yellow" }
        $rateLimit = if ($resp.Headers["Retry-After"]) { " Retry-After: $($resp.Headers["Retry-After"])s" } else { "" }
        Write-Host "  [$i] HTTP $status  (${elapsed}ms)$rateLimit" -ForegroundColor $color
        if ($status -eq 429) { $429_hit = $true }
    } catch {
        $status = [int]$_.Exception.Response.StatusCode
        $elapsed = ((Get-Date) - $start).TotalMilliseconds
        $results += [PSCustomObject]@{
            Attempt = $i
            Status  = $status
            Elapsed_ms = [math]::Round($elapsed, 0)
            Ok      = $false
        }
        Write-Host "  [$i] HTTP $status  (${elapsed}ms) [exception]" -ForegroundColor Red
        if ($status -eq 429) { $429_hit = $true }
    }

    # Small delay between attempts (don't want to hit our own rate limit on the script)
    if ($i -lt $Attempts) { Start-Sleep -Milliseconds 200 }
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "RESULT" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

$passed_early = ($results | Where-Object { $_.Attempt -le 5 -and $_.Status -ne 429 } | Measure-Object).Count -eq 5
$passed_429   = $429_hit

if ($passed_429) {
    Write-Host "  [PASS] 429 Too Many Requests received" -ForegroundColor Green
} else {
    Write-Host "  [FAIL] Never got 429 after $Attempts attempts" -ForegroundColor Red
}

if ($passed_early) {
    Write-Host "  [PASS] First 5 attempts did NOT get 429" -ForegroundColor Green
} else {
    Write-Host "  [WARN] Some early attempt returned 429 (may be a race or prior test)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Summary:" -ForegroundColor White
$results | Format-Table -AutoSize | Out-String | Write-Host

Write-Host ""
if ($passed_429 -and $passed_early) {
    Write-Host "Rate limit is working correctly!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "Rate limit may NOT be working -- check API logs." -ForegroundColor Red
    exit 1
}
