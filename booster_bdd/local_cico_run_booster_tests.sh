#!/bin/bash

# Show command before executing
set -x

# Stop on error
set -e

mkdir -p dist target

# If target did exist, remove artifacts from previous run
rm -rf target/screenshots

# Shutdown container if running
if [ -n "$(docker ps -q -f name=fabric8-booster-test)" ]; then
    docker rm -f fabric8-booster-test
fi

# Run and setup Docker image
docker build -t fabric8-booster-test:latest -f Dockerfile.builder .

docker run -it --shm-size=256m --detach=true --name=fabric8-booster-test --cap-add=SYS_ADMIN \
          -e SCENARIO \
          -e SERVER_ADDRESS \
          -e FORGE_API \
          -e WIT_API \
          -e AUTH_API \
          -e OSIO_USERNAME \
          -e OSIO_PASSWORD \
          -e OSIO_DANGER_ZONE \
          -e PIPELINE \
          -e BOOSTER_MISSION \
          -e BOOSTER_RUNTIME \
          -e BLANK_BOOSTER \
          -e GIT_REPO \
          -e PROJECT_NAME \
          -e AUTH_CLIENT_ID \
          -e REPORT_DIR \
          -e UI_HEADLESS \
          -t -v "$(pwd)"/dist:/dist:Z -v /etc/localtime:/etc/localtime:ro fabric8-booster-test:latest /bin/bash

# Start Xvfb
docker exec fabric8-booster-test /usr/bin/Xvfb :99 -screen 0 1024x768x24 &

# Exec booster tests
docker exec fabric8-booster-test ./local_run.sh 2>&1 | tee target/test.log

# Test results to archive
docker cp fabric8-booster-test:/opt/fabric8-test/target/. target

# Shutdown container if running
if [ -n "$(docker ps -q -f name=fabric8-booster-test)" ]; then
    docker rm -f fabric8-booster-test
fi

# We do want to see that zero specs have failed
grep "0 failed" target/test.log
export RTN_CODE=$?

exit $RTN_CODE

