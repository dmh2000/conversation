#!/bin/sh

echo `pgrep -a python | grep client/dist`
pgrep -a python | grep client/dist   | awk '{print $1}' | xargs kill 2> /dev/null

echo `pgrep -a ai-server | grep ai-server`
pgrep -a ai-server | grep ai-server  | awk '{print $1}' | xargs kill 2> /dev/null

echo `pgrep -a nginx | grep nginx`
pgrep -a nginx | grep nginx | awk '{print $1}' | xargs kill 2> /dev/null
