#!/bin/bash

source _setenv.sh

cd $WORKSPACE

rm -rf go go.tar.gz

wget -O go.tar.gz https://dl.google.com/go/go1.9.3.linux-amd64.tar.gz
tar -xvf go.tar.gz

mkdir -p $GOPATH/src/github.com/fabric8-services/
cd $GOPATH/src/github.com/fabric8-services/

git clone https://github.com/fabric8-services/fabric8-wit

