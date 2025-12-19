#!/bin/bash

# stop all services
./kill.sh >/dev/null 2>&1

# erase existing export
rm -rf dist

# build alice/client
pushd alice/client
echo "build alice/client"
npm run build
popd

# build bob/client
pushd bob/client
echo "build bob/client"
npm run build
popd

# build ai-server
pushd ai-server/cmd
echo "build ai-server/cmd"
go build -o ../ai-server
popd

# create dist directory
mkdir -p dist/alice
mkdir -p dist/bob
mkdir -p dist/ai-server

# export alice
cp -r alice/client/dist/* dist/alice
cp -r alice/server/server.py dist/alice

# export bob
cp -r bob/client/dist/* dist/bob
cp -r bob/server/server.py dist/bob

# export ai-server
cp ai-server/ai-server dist/ai-server

# create tar file
tar -czvf dist.tar.gz dist

# copy startup script
cp scripts/export-start.sh dist
cp scripts/export-kill.sh dist