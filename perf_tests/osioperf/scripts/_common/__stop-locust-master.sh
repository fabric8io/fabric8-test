#!/bin/bash

#source _setenv.sh

KILLSIGNAL=${1:-9}

echo "Killing a master at $MASTER_HOST ..."
ssh $SSH_USER@$MASTER_HOST 'kill -'$KILLSIGNAL' `ps aux | grep locust | grep -v grep | grep python | sed -e "s,[^0-9]* \([0-9]\+\) .*,\1,g"`' | echo "Done";

