@echo off


REM start alice/server
pushd alice
start "Alice-Server" python server.py --port 8001 --dir .
popd

REM start bob/server
pushd bob
start "Bob-Server" python server.py --port 8002 --dir .
popd

REM start ai-server
pushd ai-server
start "AI-Server" ai-server.exe
popd

REM start nginx
REM nginx -p %USERPROFILE%\nginx-local -c conf\nginx.conf
