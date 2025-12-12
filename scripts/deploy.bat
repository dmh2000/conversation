@echo off
REM Windows batch file equivalent of deploy.sh

REM stop all services
call scripts\kill.bat >nul 2>&1

REM build
call scripts\build.bat

REM run
call scripts\run.bat
