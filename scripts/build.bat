@echo off

REM stop all services
call kill.bat >nul 2>&1

REM build alice/client
cd alice\client
echo build alice/client
call npm run build
cd ..\..

REM build bob/client
cd bob\client
echo build bob/client
call npm run build
cd ..\..

REM build ai-server
cd ai-server\cmd
echo build ai-server/cmd
go build -o ..\ai-server.exe
cd ..\..
dir ai-server\ai-server.exe
