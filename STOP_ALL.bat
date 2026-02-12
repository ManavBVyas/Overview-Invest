@echo off
chcp 65001 >nul
REM ===============================================
REM ⠶⣭ OVERVIEW INVEST - TERMINATION ⣭⠶
REM ===============================================

echo.
echo ⢰⡶⢶⡆ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ⢰⡶⢶⡆
echo ⢰⡶    STOPPING ALL SERVICES    ⢶⡆
echo ⢰⡶⢶⡆ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ⢰⡶⢶⡆
echo.

REM Stop Redis
echo ⣠⣾ [1/4] HALTING REDIS ⣷⣄
docker stop redis-market >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo   ⢰⡶ DONE: Redis engine room shutdown
) else (
    echo   ⣀ SKIP: Redis was already offline
)
echo.

REM Kill Python windows
echo ⢒⣚ [2/4] DISCONNECTING ALGORITHMS ⣓⡒
taskkill /FI "WINDOWTITLE eq Python Market Sim*" /F >nul 2>&1
echo   ⢰⡶ DONE: Python simulation terminated
echo.

REM Kill Node.js windows
echo ⢾⣛ [3/4] CLOSING API GATEWAY ⣛⡷
taskkill /FI "WINDOWTITLE eq Node.js Backend*" /F >nul 2>&1
echo   ⢰⡶ DONE: System backend powered down
echo.

REM Kill React windows
echo ⢰⡿ [4/4] RECALLING INTERFACE ⣷⡆
taskkill /FI "WINDOWTITLE eq React Frontend*" /F >nul 2>&1
echo   ⢰⡶ DONE: User interface disconnected
echo.

echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo ⢰⡶⢶⡆ SYSTEM SHUTDOWN COMPLETE ⢰⡶⢶⡆
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo Press any key to exit...
pause >nul
