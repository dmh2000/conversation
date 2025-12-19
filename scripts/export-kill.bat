
REM Find and kill Python processes running with alice
echo Checking for Python processes with alice...
for /f "tokens=2" %%a in ('tasklist /FI "IMAGENAME eq python.exe" /FO LIST ^| findstr /I "PID"') do (
    wmic process where "ProcessId=%%a" get CommandLine 2>nul | findstr /I "alice" >nul
    if not errorlevel 1 (
        echo Killing Python process %%a
        REM taskkill /F /PID %%a >nul 2>&1
    )
)

REM Find and kill Python processes running with bob
echo Checking for Python processes with bob...
for /f "tokens=2" %%a in ('tasklist /FI "IMAGENAME eq python.exe" /FO LIST ^| findstr /I "PID"') do (
    wmic process where "ProcessId=%%a" get CommandLine 2>nul | findstr /I "bob" >nul
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