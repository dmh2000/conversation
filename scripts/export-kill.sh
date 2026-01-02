#!/bin/sh

# stop all services
pgrep -a python | grep server.py
pgrep -a python | grep server.py   | awk '{print $1}' | xargs kill 2> /dev/null

pgrep -a ai-server | grep ai-server   
pgrep -a ai-server | grep ai-server  | awk '{print $1}' | xargs kill 2> /dev/null

echo services stopped

pgrep -a nginx | grep nginx  
~/nginx-local/sbin/nginx -s stop