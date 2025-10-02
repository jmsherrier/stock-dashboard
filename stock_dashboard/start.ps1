Write-Host "Starting Volatiliraptor Stock Dashboard..." -ForegroundColor Green
Write-Host ""

Write-Host "Starting backend server..." -ForegroundColor Yellow
$serverJob = Start-Job -ScriptBlock {
    Set-Location "c:\Users\jmshe\Documents\GitHub\volatiliraptor\stock_dashboard\server"
    npm start
}

# Wait a moment for server to start
Start-Sleep -Seconds 3

Write-Host "Starting frontend..." -ForegroundColor Yellow
Set-Location "c:\Users\jmshe\Documents\GitHub\volatiliraptor\stock_dashboard"

try {
    npm start
} finally {
    # Cleanup: Stop the background server job
    Write-Host "Cleaning up..." -ForegroundColor Red
    Stop-Job $serverJob -PassThru | Remove-Job
}