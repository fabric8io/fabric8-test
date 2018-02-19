#!/bin/bash

source _setenv.sh

cd $GOPATH/src/github.com/fabric8-services/fabric8-wit

docker-compose down
docker-compose up -d
make test-integration-benchmark 2>$WORKSPACE/$JOB_BASE_NAME-$BUILD_NUMBER-error.log 1>$WORKSPACE/$JOB_BASE_NAME-$BUILD_NUMBER.log

cat $WORKSPACE/$JOB_BASE_NAME-$BUILD_NUMBER.log | grep "ns/op" | sed -e 's,[ ]*\t\+[ ]*,;,g' | sed -e 's, ,;,g' > $WORKSPACE/$JOB_BASE_NAME-$BUILD_NUMBER-results.csv

