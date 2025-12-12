@echo off

REM stop all services
call kill.bat >nul 2>&1

REM build alice/client
pushd alice\client
echo build alice/client
call npm run build
popd

REM build bob/client
pushd bob\client
echo build bob/client
call npm run build
popd

REM build ai-server
pushd ai-server\cmd
echo build ai-server/cmd
go build -o ..\ai-server.exe
popd
