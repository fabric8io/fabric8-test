#!/bin/bash

source _setenv.sh

cd $GOPATH/src/github.com/fabric8-services/fabric8-wit

make clean
make deps
make build

