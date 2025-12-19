@echo off
REM Windows batch version of export.sh

REM stop all services
call kill.bat >nul 2>&1

REM erase existing export
if exist dist rmdir /s /q dist

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

REM create dist directory
mkdir dist\alice 2>nul
mkdir dist\bob 2>nul
mkdir dist\ai-server 2>nul

REM export alice
xcopy /e /i /y alice\client\dist\* dist\alice
xcopy /e /i /y alice\server\dist\* dist\alice

REM export bob
xcopy /e /i /y bob\client\dist\* dist\bob
xcopy /e /i /y bob\server\dist\* dist\bob

REM export ai-server
copy /y ai-server\ai-server.exe dist\ai-server\

REM create zip file (tar available in Windows 10+)
tar -czvf dist.tar.gz dist

REM create zip alternative for older Windows
REM powershell Compress-Archive -Path dist -DestinationPath dist.zip -Force

REM copy startup script
copy /y scripts\start.bat dist\
