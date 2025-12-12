@echo off
REM Windows batch file equivalent of kill.sh

REM Find and kill Python processes running with client/dist
echo Checking for Python processes with client/dist...
for /f "tokens=2" %%a in ('tasklist /FI "IMAGENAME eq python.exe" /FO LIST ^| findstr /I "PID"') do (
    wmic process where "ProcessId=%%a" get CommandLine 2>nul | findstr /I "client\\dist" >nul
    if not errorlevel 1 (
        echo Killing Python process %%a
        REM taskkill /F /PID %%a >nul 2>&1
    )
)

REM Find and kill ai-server processes
echo Checking for ai-server processes...
for /f "tokens=2" %%a in ('tasklist /FI "IMAGENAME eq ai-server.exe" /FO LIST ^| findstr /I "PID"') do (
    echo Killing ai-server process %%a
    REM taskkill /F /PID %%a >nul 2>&1
)

REM Stop nginx
echo Stopping nginx...
for /f "tokens=2" %%a in ('tasklist /FI "IMAGENAME eq nginx.exe" /FO LIST ^| findstr /I "PID"') do (
    echo Killing ai-server process %%a
    REM taskkill /F /PID %%a >nul 2>&1
)

echo Done.