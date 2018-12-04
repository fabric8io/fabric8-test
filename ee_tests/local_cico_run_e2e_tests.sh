#!/bin/bash

# Export test configuration
. ./config/local_osio.conf.sh

# Show command before executing
set -x

# Stop on error
set -e

# Remove artefacts from previous run
rm -rf target
mkdir -p dist target

# Shutdown container if running
if [ -n "$(docker ps -a -q -f name=fabric8-test)" ]; then
    docker rm -f fabric8-test
fi

# Run and setup Docker image
docker run --shm-size=256m --detach=true --name=fabric8-test --cap-add=SYS_ADMIN --network="host" \
          -e OSIO_USERNAME -e OSIO_PASSWORD -e OSIO_URL  \
          -e OSO_USERNAME -e GITHUB_USERNAME -e GITHUB_REPO -e TEST_SUITE -e QUICKSTART_NAME -e RELEASE_STRATEGY \
          -e FEATURE_LEVEL -e RESET_ENVIRONMENT -e DEBUG \
          -e "FORCE_COLOR=1" \
          -t -v "$(pwd)/dist:/dist:Z" -v /var/run/docker.sock:/var/run/docker.sock \
          fabric8-test:latest

# Start Xvfb
docker exec fabric8-test /usr/bin/Xvfb :99 -screen 0 1024x768x24 &

# Exec EE tests
docker exec fabric8-test ./ts-protractor.sh "$TEST_SUITE" | tee target/protractor.log

# Test results to archive
docker cp fabric8-test:/opt/fabric8-test/target/. target

# Shutdown container if running
if [ -n "$(docker ps -a -q -f name=fabric8-test)" ]; then
    docker rm -f fabric8-test
fi





