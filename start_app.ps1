# ============================================
# Overview Invest Trading Platform - Startup Script (PowerShell)
# Starts all 4 required services automatically
# ============================================

Write-Host "`n===============================================" -ForegroundColor Cyan
Write-Host "   OVERVIEW INVEST - TRADING PLATFORM" -ForegroundColor Cyan
Write-Host "===============================================`n" -ForegroundColor Cyan

Write-Host "Starting all services...`n" -ForegroundColor Yellow

# Get script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

# Service 1: Redis
Write-Host "[1/4] Starting Redis Server..." -ForegroundColor Green
Write-Host "----------------------------------------`n"

try {
    # Check if Redis container exists
    $redisExists = docker ps -a --filter "name=redis-market" --format "{{.Names}}" 2>$null
    
    if ($redisExists) {
        Write-Host "Found existing Redis container, starting it..." -ForegroundColor Yellow
        docker start redis-market | Out-Null
    } else {
        Write-Host "Creating new Redis container..." -ForegroundColor Yellow
        docker run -d -p 6379:6379 --name redis-market redis:latest | Out-Null
    }
    
    Write-Host "✅ Redis: STARTED" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ ERROR: Failed to start Redis" -ForegroundColor Red
    Write-Host "Make sure Docker Desktop is installed and running" -ForegroundColor Yellow
    Write-Host "Download from: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    pause
    exit 1
}

# Wait for Redis to initialize
Start-Sleep -Seconds 2

# Service 2: Python Market Simulation
Write-Host "[2/4] Starting Python Market Simulation..." -ForegroundColor Green
Write-Host "----------------------------------------`n"

$pythonPath = Join-Path $ScriptDir "python-market-sim"
$pythonVenv = Join-Path $pythonPath "venv\Scripts\Activate.ps1"

if (-not (Test-Path $pythonVenv)) {
    Write-Host "⚠️  Python virtual environment not found!" -ForegroundColor Yellow
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    Set-Location $pythonPath
    python -m venv venv
    & $pythonVenv
    pip install -r requirements.txt
    Set-Location $ScriptDir
}

Start-Process powershell -ArgumentList "-NoExit", "-Command",  "cd '$pythonPath'; & '$pythonVenv'; python main.py" -WindowStyle Normal
Write-Host "✅ Python Service: STARTED (new window)" -ForegroundColor Green
Write-Host ""

# Wait for Python to initialize
Start-Sleep -Seconds 3

# Service 3: Node.js Backend
Write-Host "[3/4] Starting Node.js Backend..." -ForegroundColor Green
Write-Host "----------------------------------------`n"

$serverPath = Join-Path $ScriptDir "server"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$serverPath'; npm run dev" -WindowStyle Normal
Write-Host "✅ Node.js Backend: STARTED (new window)" -ForegroundColor Green
Write-Host ""

# Wait for Node.js to initialize
Start-Sleep -Seconds 3

# Service 4: React Frontend
Write-Host "[4/4] Starting React Frontend..." -ForegroundColor Green
Write-Host "----------------------------------------`n"

$clientPath = Join-Path $ScriptDir "client"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$clientPath'; npm run dev" -WindowStyle Normal
Write-Host "✅ React Frontend: STARTED (new window)" -ForegroundColor Green
Write-Host ""

# Success summary
Write-Host "`n===============================================" -ForegroundColor Cyan
Write-Host "   ALL SERVICES STARTED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "===============================================`n" -ForegroundColor Cyan

Write-Host "You should now have 3 new PowerShell windows open:" -ForegroundColor White
Write-Host "  🐍 Python Market Simulation" -ForegroundColor Yellow
Write-Host "  🟢 Node.js Backend" -ForegroundColor Yellow
Write-Host "  ⚛️  React Frontend" -ForegroundColor Yellow
Write-Host ""
Write-Host "🔴 Redis is running in Docker (background)`n" -ForegroundColor Yellow

Write-Host "📱 Access the application:" -ForegroundColor White
Write-Host "  Frontend: " -NoNewline; Write-Host "http://localhost:5173" -ForegroundColor Cyan
Write-Host "  Backend:  " -NoNewline; Write-Host "http://localhost:5000" -ForegroundColor Cyan
Write-Host ""

Write-Host "⏹️  To stop all services:" -ForegroundColor White
Write-Host "  1. Close the 3 PowerShell windows" -ForegroundColor Gray
Write-Host "  2. Run: " -NoNewline; Write-Host "docker stop redis-market" -ForegroundColor Yellow
Write-Host ""

Write-Host "Press any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
