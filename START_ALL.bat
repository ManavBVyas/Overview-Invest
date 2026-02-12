@echo off
REM ===============================================
REM OVERVIEW INVEST - STARTUP
REM ===============================================

echo.
echo -----------------------------------------------------
echo      OVERVIEW INVEST - TRADING SYSTEM
echo -----------------------------------------------------
echo.
echo [INFO] Initializing Services...
echo.

REM Check if Docker is running
docker ps >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker is not running!
    echo Please start Docker Desktop and try again.
    echo.
    pause
    exit /b 1
)

REM Start Redis
echo [1/5] Starting Redis...
docker ps -a --filter "name=redis-market" --format "{{.Names}}" | findstr "redis-market" >nul
if %ERRORLEVEL% EQU 0 (
    echo    - Redis container exists, starting...
    docker start redis-market >nul 2>&1
) else (
    echo    - Creating new Redis container...
    docker run -d -p 6379:6379 --name redis-market redis:latest >nul
)
echo    - Redis active on port 6379
echo.
timeout /t 2 /nobreak >nul

REM Start PostgreSQL
echo [2/5] Starting Database...
docker ps -a --filter "name=postgres-db" --format "{{.Names}}" | findstr "postgres-db" >nul
if %ERRORLEVEL% EQU 0 (
    echo    - Database container exists, starting...
    docker start postgres-db >nul 2>&1
) else (
    echo    - Creating new Database container...
    docker run -d -p 5432:5432 --name postgres-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=overview_invest postgres:15 >nul
)
echo    - Database active on port 5432
echo.
timeout /t 3 /nobreak >nul

REM Start Python Service
echo [3/5] Starting Market Simulation...
start "Python Market Sim" /D "%~dp0python-market-sim" cmd /k "venv\Scripts\activate && python main.py"
echo    - Python Service launched
echo.
timeout /t 2 /nobreak >nul

REM Start Node.js Backend
echo [4/5] Starting System Backend...
start "Node.js Backend" /D "%~dp0server" cmd /k "node index.js"
echo    - Backend API launched
echo.
timeout /t 2 /nobreak >nul

REM Start React Frontend
echo [5/5] Starting User Interface...
start "React Frontend" /D "%~dp0client" cmd /k "npm run dev"
echo    - Frontend UI launched
echo.

echo -----------------------------------------------------
echo           ALL SERVICES OPERATIONAL
echo -----------------------------------------------------
echo.
echo Keep the 3 new command windows open.
echo.
echo Open your browser to: http://localhost:5173
echo.
echo To stop everything:
echo   1. Close the 3 command windows
echo   2. Run: docker stop redis-market postgres-db
echo.
echo Press any key to close this launcher...
pause >nul
