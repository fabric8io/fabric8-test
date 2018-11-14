#!/bin/bash

set -x

export GOPATH="$(pwd)/local-gopath"
mkdir -p "$GOPATH"

go get -u github.com/fabric8-services/fabric8-auth

cd $GOPATH/src/github.com/fabric8-services/fabric8-auth

make dev