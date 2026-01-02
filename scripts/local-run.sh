#!/bin/bash

# stop all services
./scripts/local-kill.sh

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

# start nginx
~/nginx-local/sbin/nginx -p $HOME/nginx-local -c conf/nginx.conf