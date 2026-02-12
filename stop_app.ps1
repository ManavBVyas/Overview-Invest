# ============================================
# ⠶⣭ OVERVIEW INVEST - TERMINATION ⣭⠶
# ============================================

$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "`n⢰⡶⢶⡆ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ⢰⡶⢶⡆" -ForegroundColor Red
Write-Host "⢰⡶    STOPPING ALL SERVICES    ⢶⡆" -ForegroundColor Red
Write-Host "⢰⡶⢶⡆ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ⢰⡶⢶⡆`n" -ForegroundColor Red

# Stop Redis
Write-Host "⣠⣾ [1/4] HALTING REDIS ⣷⣄" -ForegroundColor Yellow
try {
    docker stop redis-market 2>$null | Out-Null
    Write-Host "  ⢰⡶ DONE: Redis engine room shutdown" -ForegroundColor Green
}
catch {
    Write-Host "  ⣀ SKIP: Redis was already offline" -ForegroundColor Gray
}

# Kill Python processes
Write-Host "`n⢒⣚ [2/4] DISCONNECTING ALGORITHMS ⣓⡒" -ForegroundColor Yellow
Get-Process | Where-Object { $_.MainWindowTitle -like "*Python Market Sim*" } | Stop-Process -Force 2>$null
Write-Host "  ⢰⡶ DONE: Python simulation terminated" -ForegroundColor Green

# Kill Node.js processes
Write-Host "`n⢾⣛ [3/4] CLOSING API GATEWAY ⣛⡷" -ForegroundColor Yellow
Get-Process | Where-Object { $_.MainWindowTitle -like "*Node.js Backend*" } | Stop-Process -ProcessName "node" -ErrorAction SilentlyContinue
Get-Process | Where-Object { $_.MainWindowTitle -like "*Node.js Backend*" } | Stop-Process -Force 2>$null
Write-Host "  ⢰⡶ DONE: System backend powered down" -ForegroundColor Green

# Kill React/Vite processes
Write-Host "`n⢰⡿ [4/4] RECALLING INTERFACE ⣷⡆" -ForegroundColor Yellow
Get-Process | Where-Object { $_.MainWindowTitle -like "*React Frontend*" } | Stop-Process -Force 2>$null
Write-Host "  ⢰⡶ DONE: User interface disconnected" -ForegroundColor Green

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "⢰⡶⢶⡆ SYSTEM SHUTDOWN COMPLETE ⢰⡶⢶⡆" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Green

Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
