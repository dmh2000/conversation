#!/bin/bash

# stop all services
./kill.sh >/dev/null 2>&1

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

