@echo off

REM stop all services
call kill.bat >nul 2>&1

REM start alice/server
cd alice\server
start /B python server.py --port 8001 --dir ..\client\dist
cd ..\..

REM start bob/server
cd bob\server
start /B python server.py --port 8002 --dir ..\client\dist
cd ..\..

REM start ai-server
cd ai-server
start /B ai-server.exe
cd ..

REM start nginx
start d:\nginx-1.29.4\nginx -c conf\nginx.conf