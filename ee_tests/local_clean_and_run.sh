#!/usr/bin/env bash

set -x

export TOKEN=$1
export USERNAME=$2
export PASSWORD=$3
export URL=$4

sh ./local_cleanup.sh $USERNAME $TOKEN 
sh ./local_run_EE_tests.sh $USERNAME $PASSWORD $URL


