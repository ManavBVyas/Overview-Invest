@echo off
chcp 65001 >nul
REM ===============================================
REM ⠶⣭ OVERVIEW INVEST - STARTUP ⣭⠶
REM ===============================================

echo.
echo ⢰⡿⣷⡆ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ⢰⡿⣷⡆
echo ⢰⡿    OVERVIEW INVEST - TRADING    ⣿⡆
echo ⢰⡿⣷⡆ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ⢰⡿⣷⡆
echo.
echo ⢒⣚ INITIALIZING ALL SERVICES ⣓⡒
echo.

REM Get the script directory
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

echo ⣠⣾ [1/4] STARTING REDIS SERVER ⣷⣄
echo ----------------------------------------
docker ps -q --filter "name=redis-market" > nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo   ⠶ Redis container already running
    docker start redis-market > nul 2>&1
) else (
    echo   ⠶ Creating new Redis container...
    docker run -d -p 6379:6379 --name redis-market redis:latest
)
if %ERRORLEVEL% NEQ 0 (
    echo ⢰⡶ [ ERROR ] Failed to start Redis ⢶⡆
    echo   Make sure Docker is installed and running
    pause
    exit /b 1
)
echo   ⢠⡶ DONE: Redis background engine active
echo.

REM Wait a moment for Redis to initialize
timeout /t 2 /nobreak > nul

echo ⢒⣚ [2/4] STARTING MARKET SIMULATION ⣓⡒
echo ----------------------------------------
start "Python Market Sim" cmd /k "chcp 65001 >nul && cd /d "%SCRIPT_DIR%python-market-sim" && venv\Scripts\activate && python main.py"
echo   ⢠⡶ DONE: Python service engaged (new window)
echo.

REM Wait for Python to initialize
timeout /t 3 /nobreak > nul

echo ⢾⣛ [3/4] STARTING SYSTEM BACKEND ⣛⡷
echo ----------------------------------------
start "Node.js Backend" cmd /k "chcp 65001 >nul && cd /d "%SCRIPT_DIR%server" && npm run dev"
echo   ⢠⡶ DONE: Node.js backend operational (new window)
echo.

REM Wait for Node.js to initialize
timeout /t 3 /nobreak > nul

echo ⢰⡿ [4/4] STARTING USER INTERFACE ⣷⡆
echo ----------------------------------------
start "React Frontend" cmd /k "chcp 65001 >nul && cd /d "%SCRIPT_DIR%client" && npm run dev"
echo   ⢠⡶ DONE: React app deployed (new window)
echo.

echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo ⢰⡶⢶⡆ ALL SERVICES OPERATIONAL ⢰⡶⢶⡆
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo You should now have 3 new command windows open:
echo   - Python Market Simulation
echo   - Node.js Backend
echo   - React Frontend
echo.
echo Redis is running in Docker (background)
echo.
echo To access the app:
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:5000
echo.
echo To stop all services:
echo   - Close the 3 command windows
echo   - Run: docker stop redis-market
echo.
echo Press any key to exit this window...
pause > nul
