#!/bin/sh

pgrep -a python | grep client/dist
pgrep -a python | grep client/dist   | awk '{print $1}' | xargs kill 2> /dev/null

pgrep -a ai-server | grep ai-server   
pgrep -a ai-server | grep ai-server  | awk '{print $1}' | xargs kill 2> /dev/null

pgrep -a nginx | grep nginx  
~/nginx-local/sbin/nginx -s stop