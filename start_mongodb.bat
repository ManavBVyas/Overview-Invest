@echo off
echo Attempting to find and start MongoDB...

:: Common Paths
set "PATHS=C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe;C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe;C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe;C:\Program Files\MongoDB\Server\5.0\bin\mongod.exe;C:\MongoDB\bin\mongod.exe"

for %%P in ("%PATHS:;=" "%") do (
    if exist %%P (
        echo Found MongoDB at %%P
        if not exist "C:\data\db" (
            echo Creating data directory C:\data\db...
            mkdir "C:\data\db"
        )
        echo Starting MongoDB...
        %%P --dbpath="C:\data\db"
        goto :EOF
    )
)

echo.
echo ❌ Could not find mongod.exe in common locations.
echo Please edit this script to point to your 'mongod.exe' or add it to your PATH.
echo.
pause
