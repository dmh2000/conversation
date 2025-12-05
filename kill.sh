#!/bin/sh

pgrep -a python | grep client/dist | awk '{print $1}' | xargs kill
