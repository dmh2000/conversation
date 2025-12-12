@echo off
REM Windows batch file equivalent of deploy.sh

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

REM start alice/server
pushd alice\server
start /B python server.py --port 8001 --dir ..\client\dist
popd

REM start bob/server
pushd bob\server
start /B python server.py --port 8002 --dir ..\client\dist
popd

REM start ai-server
pushd ai-server
start /B ai-server.exe
popd

REM start nginx
start d:\nginx-1.29.4\nginx -c conf\nginx.conf