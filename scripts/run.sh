#!/bin/bash

# stop all services
pgrep -a python | grep client/dist
pgrep -a python | grep client/dist   | awk '{print $1}' | xargs kill 2> /dev/null

pgrep -a ai-server | grep ai-server   
pgrep -a ai-server | grep ai-server  | awk '{print $1}' | xargs kill 2> /dev/null


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
