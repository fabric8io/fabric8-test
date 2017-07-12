!# /bin/sh

set -x

export TOKEN=$1
export USERNAME=$2
export PASSWORD=$3
export URL=$4

sh ./local_cleanup2.sh $USERNAME $TOKEN 
sh ./local_run_EE_tests.sh $USERNAME $PASSWORD $URL


