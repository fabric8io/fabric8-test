#!/bin/bash

# Export test configuration
. ./config/local_osio.conf.sh

# Show command before executing
set -x

# Stop on error
set -e

mkdir -p dist

# Shutdown container if running
if [ -n "$(docker ps -q -f name=fabric8-test)" ]; then
    docker rm -f fabric8-test
fi

# Run and setup Docker image
docker run --detach=true --name=fabric8-test --cap-add=SYS_ADMIN \
          -e OSIO_USERNAME -e OSIO_PASSWORD -e OSIO_URL  \
          -e OSO_USERNAME -e GITHUB_USERNAME -e TEST_SUITE -e QUICKSTART_NAME -e RELEASE_STRATEGY \
          -e RESET_ENVIRONMENT -e DEBUG -e "API_URL=http://api.openshift.io/api/" \
          -p 5999:5999 -t -v $(pwd)/dist:/dist:Z fabric8-test:latest

# Start VNC Server
docker exec fabric8-test /usr/bin/vncserver :99 -geometry 1024x768 -depth 24

# Exec EE tests
docker exec fabric8-test ./ts-protractor.sh $TEST_SUITE | tee target/theLog.txt

# Test results to archive
docker cp fabric8-test:/opt/fabric8-test/target/. target

# Shutdown container if running
if [ -n "$(docker ps -q -f name=fabric8-test)" ]; then
    docker rm -f fabric8-test
fi





