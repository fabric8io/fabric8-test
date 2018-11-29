#!/bin/bash

source _setenv.sh

./_clean-locally.sh

export COMMON="common.git"
git clone https://github.com/pmacik/openshiftio-performance-common $COMMON

source $COMMON/config/_setenv.sh


echo " Wait for the server to become available"
./_wait-for-server.sh
if [ $? -gt 0 ]; then
    exit 1
fi

echo " Prepare locustfile template"
./_prepare-locustfile.sh workshop-demo.py

rm -rvf $LOG_DIR;

$COMMON/_execute.sh
./_clean-chromedriver.sh
