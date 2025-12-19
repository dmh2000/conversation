#!/bin/bash

# stop all services
./export-kill.sh

# start alice/server 
pushd alice
python server.py --port 8001 --dir . &
popd

# start bob/server 
pushd bob
python server.py --port 8002 --dir . &
popd

# start ai-server
pushd ai-server
./ai-server &
popd

# start nginx
# ~/nginx-local/sbin/nginx -p $HOME/nginx-local -c conf/nginx.conf