#!/bin/bash

#source _setenv.sh

for i in $(seq 1 $SLAVES); do
   echo "Killing a slave at $SLAVE_PREFIX$i ($i/$SLAVES) ...";
   ssh $SSH_USER@$SLAVE_PREFIX$i 'kill -9 `ps aux | grep locust | grep -v grep | grep python | sed -e "s,[^0-9]* \([0-9]\+\) .*,\1,g"`' | echo "Done";
done
