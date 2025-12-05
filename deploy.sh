#!/bin/bash

# stop all services
./kill.sh >/dev/null 2>&1

# build alice/client
pushd alice/client
npm run build
popd

# build bob/client
pushd bob/client
npm run build
popd

# build proxy
pushd proxy
python -m build
popd

# start alice/server 
pushd alice/server
python server.py --port 8001 --dir ../client/dist &
popd

# start bob/server 
pushd bob/server
python server.py --port 8002 --dir ../client/dist &
popd

# start proxy
pushd proxy
python server.py
popd
