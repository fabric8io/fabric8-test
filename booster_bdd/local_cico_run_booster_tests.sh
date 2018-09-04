#!/bin/bash

# Show command before executing
set -x

# Stop on error
set -e

# Assign default values if not defined in the environment
## An output directory where the reports will be stored
export REPORT_DIR=${REPORT_DIR:-target}

export ZABBIX_ENABLED="${ZABBIX_ENABLED:-false}"

export ZABBIX_SERVER="${ZABBIX_SERVER:-zabbix.devshift.net}"

export ZABBIX_HOST="${ZABBIX_HOST:-qa_openshift.io}"

export ZABBIX_METRIC_PREFIX="${ZABBIX_METRIC_PREFIX:-booster-bdd.$SCENARIO}"

# If report dir did exist, remove artifacts from previous run
rm -rf "$REPORT_DIR"
mkdir -p "$REPORT_DIR"

export CONTAINER_NAME="fabric8-booster-test"

# Shutdown container if running
if [ -n "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then
    docker rm -f "$CONTAINER_NAME"
fi

# Run and setup Docker image
docker build -t "$CONTAINER_NAME":latest -f Dockerfile.builder .

docker run -it --shm-size=256m --detach=true --name="$CONTAINER_NAME" --cap-add=SYS_ADMIN \
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
          -e ZABBIX_SERVER \
          -e ZABBIX_HOST \
          -e ZABBIX_METRIC_PREFIX \
          -t -v /etc/localtime:/etc/localtime:ro "$CONTAINER_NAME":latest /bin/bash

# Start Xvfb
docker exec "$CONTAINER_NAME" /usr/bin/Xvfb :99 -screen 0 1024x768x24 &

# Exec booster tests
docker exec "$CONTAINER_NAME" ./local_run.sh 2>&1 | tee "$REPORT_DIR/test.log"

if [ "$ZABBIX_ENABLED" = true ] ; then
    docker exec "$CONTAINER_NAME" zabbix_sender -vv -T -i "./$REPORT_DIR/zabbix-report.txt" -z "$ZABBIX_SERVER"
fi

# Test results to archive
docker cp "$CONTAINER_NAME:/opt/fabric8-test/$REPORT_DIR/." "$REPORT_DIR"

# Shutdown container if running
if [ -n "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then
    docker rm -f "$CONTAINER_NAME"
fi

# We do want to see that zero specs have failed
grep "0 failed" "$REPORT_DIR/test.log"
export RTN_CODE=$?

exit $RTN_CODE

