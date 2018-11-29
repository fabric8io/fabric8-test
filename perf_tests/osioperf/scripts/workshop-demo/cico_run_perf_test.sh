#!/bin/bash

#set -x

set -e

# Shutdown container if running
function remove_container {
    if [ -n "$(docker ps -q -a -f name="$1")" ]; then
        docker rm -f "$1"
    fi
}

function archive_artifacts {
    chmod 600 ../artifacts.key
    chown root:root ../artifacts.key
    rsync --password-file=../artifacts.key -qPHva --relative "./$ARTIFACTS_DIR" devtools@artifacts.ci.centos.org::devtools/
    echo "Artifacts were uploaded to http://artifacts.ci.centos.org/devtools/$ARTIFACTS_DIR"
}

export TEST_IMAGE_NAME="fabric8-test-$JOB_BASE_NAME-$BUILD_NUMBER"
export TEST_CONTAINER_NAME="test-$JOB_BASE_NAME-$BUILD_NUMBER"

export ARTIFACTS_DIR="$JOB_BASE_NAME-$BUILD_NUMBER"
rm -rf "$ARTIFACTS_DIR"
mkdir -p "$ARTIFACTS_DIR"

echo; echo "[Removing possible old docker container]"
remove_container "$TEST_CONTAINER_NAME"

echo; echo "[Building docker image]";
if [ "$USERS_PROPERTIES_FILE" != "users.properties" ]; then
    cp -vf "$USERS_PROPERTIES_FILE" users.properties
fi
docker build -f Dockerfile.builder -t "$TEST_IMAGE_NAME" . > "$ARTIFACTS_DIR/docker-build.log"
if [ "$USERS_PROPERTIES_FILE" != "users.properties" ]; then
    rm -rvf users.properties
fi

echo; echo "[Running docker container]"
docker run --shm-size=256m --detach=true --name="$TEST_CONTAINER_NAME" --cap-add=SYS_ADMIN \
    -e "DURATION=$DURATION" \
    -e "JOB_BASE_NAME=$JOB_BASE_NAME" \
    -e "BUILD_NUMBER=$BUILD_NUMBER" \
    --name "$TEST_CONTAINER_NAME" -t "$TEST_IMAGE_NAME"

echo; echo "[Starting Xvfb]"
docker exec "$TEST_CONTAINER_NAME" /usr/bin/Xvfb :99 -screen 0 1920x1080x24 &

echo; echo "[Running the test]"
docker exec "$TEST_CONTAINER_NAME" ./run.sh

echo; echo "[Gathering test results and artifacts]"
CONTAINER_WORKING_DIR=$(docker exec "$TEST_CONTAINER_NAME" /bin/bash -c 'pwd')
echo "PWD=$CONTAINER_WORKING_DIR"
docker cp "$TEST_CONTAINER_NAME:$CONTAINER_WORKING_DIR/$JOB_BASE_NAME-$BUILD_NUMBER-logs/." "$ARTIFACTS_DIR"
for i in $(docker exec "$TEST_CONTAINER_NAME" /bin/bash -c 'readlink -f $(ls | grep -e "\(\.png\|\.log\)")'); do
    docker cp "$TEST_CONTAINER_NAME:$i" "$ARTIFACTS_DIR"
done

echo; echo "[Removing docker container]"
remove_container "$TEST_CONTAINER_NAME"