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

# start alice/server 
pushd alice/server
python server.py --port 8001 --dir ../client/dist &
popd

# start bob/server 
pushd bob/server
python server.py --port 8002 --dir ../client/dist &
popd

# start ai-server
pushd ai-server
./ai-server &
popd
