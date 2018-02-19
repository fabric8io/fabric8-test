#!/bin/bash

source _setenv.sh

LOCUST_FILE=${2:-osioperf.py}

echo "Creating locustfile template $LOCUST_FILE"
cp -rvf ${1:-workshop-demo.py} $LOCUST_FILE

echo "Filtering $LOCUST_FILE"
sed -i -e 's,@@SERVER_SCHEME@@,'$SERVER_SCHEME',g' $LOCUST_FILE;
sed -i -e 's,@@SERVER_HOST@@,'$SERVER_HOST',g' $LOCUST_FILE;
