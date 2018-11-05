#!/bin/bash
########################################################################################
# $1 - (optional) if defined, will start fabric8-ui, otherwise needs an externally     #
#      managed deployment such as openshift.io or prod-preview.openshift.io            #
########################################################################################

# Shutdown container if running
function remove_container {
    if [ -n "$(docker ps -q -f name="$1")" ]; then
        docker rm -f "$1"
    fi
}

function start_fabric8_ui {
    export UI_CONTAINER_NAME="ui-$JOB_NAME"
    remove_container "$UI_CONTAINER_NAME"

    docker build -t "$UI_CONTAINER_NAME" -f ../../fabric8-ui/Dockerfile.builder ../../fabric8-ui

    docker run --detach=true --name="$UI_CONTAINER_NAME" -t \
        -v $(pwd)/dist:/dist:Z -P --network="host" "$UI_CONTAINER_NAME"

    docker exec "$UI_CONTAINER_NAME" npm install

    docker exec "$UI_CONTAINER_NAME" /bin/bash -c "HOST=0.0.0.0 npm start" &

    # Wait for fabric8-ui to compile all modules and start the server
    i=1
    while [ $i -le 5 ]; do
        curl -I -X GET $OSIO_URL
        if [ ! $? -eq 0 ]; then
            if [ $i -eq 5 ]; then
                echo "Fabric8 UI did not start in more than 5 minutes"
                return 5
            fi
            sleep 60
            ((i++))
        else
            break
        fi
    done
}

function archive_artifacts {
    chmod 600 ../artifacts.key
    chown root:root ../artifacts.key
    rsync --password-file=../artifacts.key -qPHva --relative "./$ARTIFACTS_DIR" devtools@artifacts.ci.centos.org::devtools/
    echo "Artifacts were uploaded to http://artifacts.ci.centos.org/devtools/$ARTIFACTS_DIR"
}

# Do not reveal secrets
set +x

# Do not exit on failure so that artifacts can be archived
set +e

# Source environment variables of the jenkins slave
# that might interest this worker.
if [ -e "../jenkins-env" ]; then
  grep -E "(JENKINS_URL|GIT_BRANCH|GIT_COMMIT|JOB_NAME|BUILD_NUMBER|ghprbSourceBranch|\
  |ghprbActualCommit|BUILD_URL|ghprbPullId|RESET_ENVIRONMENT|\
  |OSIO_CLUSTER|OSIO_USERNAME|OSIO_PASSWORD|TEST_SUITE|OSIO_URL|GITHUB_USERNAME|GITHUB_REPO|\
  |QUICKSTART_NAME|RELEASE_STRATEGY|FEATURE_LEVEL|ZABBIX_ENABLED)=" ../jenkins-env \
  | sed 's/^/export /g' \
  > /tmp/jenkins-env
  source /tmp/jenkins-env
fi

# Assign default values if not defined in Jenkins job
export ARTIFACTS_DIR=e2e/${JOB_NAME}/${BUILD_NUMBER}
export TEST_CONTAINER_NAME="test-$JOB_NAME"
export DEBUG="true"
export FEATURE_LEVEL=${FEATURE_LEVEL:-"released"}
export GITHUB_REPO=${GITHUB_REPO:-""}
export GITHUB_USERNAME=${GITHUB_USERNAME:-"osiotestmachine"}
export OSIO_URL=${OSIO_URL:-"https://openshift.io"}
export OSO_USERNAME=${OSIO_USERNAME:-""}
export QUICKSTART_NAME=${QUICKSTART_NAME:-"SpringBootHttp"}
export RELEASE_STRATEGY=${RELEASE_STRATEGY:-"releaseStageApproveAndPromote"}
export RESET_ENVIRONMENT=${RESET_ENVIRONMENT:-"true"}
export TEST_SUITE=${TEST_SUITE:-"smoketest"}
export ZABBIX_ENABLED=${ZABBIX_ENABLED:-"true"}
export ZABBIX_HOST="qa-starter-$OSIO_CLUSTER"
export ZABBIX_METRIC_PREFIX=$FEATURE_LEVEL
export ZABBIX_PORT="9443"
export ZABBIX_SERVER="zabbix.devshift.net"

# We need to disable selinux for now, XXX
/usr/sbin/setenforce 0

mkdir -p "$ARTIFACTS_DIR" dist

# Get all the deps in
time yum -y install docker > "$ARTIFACTS_DIR/yum_install.log"
service docker start

cp /tmp/jenkins-env .

if [ ! -z $1 ]; then
    start_fabric8_ui | tee "$ARTIFACTS_DIR/start_fabric8_ui.log"
    if [ ! $? -eq 0 ]; then
        archive_artifacts
        remove_container "$UI_CONTAINER_NAME"
        exit 5
    fi
fi

TEST_IMAGE="fabric8-test"
REPOSITORY="fabric8io"
REGISTRY="registry.devshift.net"

echo "Pull fabric8-test image"
time docker pull "$REGISTRY/$REPOSITORY/$TEST_IMAGE:latest" > "$ARTIFACTS_DIR/docker_pull.log"

# Shutdown container if running
remove_container "$TEST_CONTAINER_NAME"

echo "Run test container"
echo "Container name: $TEST_CONTAINER_NAME"
docker run --shm-size=256m --detach=true --name="$TEST_CONTAINER_NAME" --cap-add=SYS_ADMIN \
          -e "CI=true" -e DEBUG -e FEATURE_LEVEL -e "FORCE_COLOR=1" -e GITHUB_REPO -e GITHUB_USERNAME \
          -e OSIO_PASSWORD -e OSIO_URL -e OSIO_USERNAME -e OSO_USERNAME \
          -e QUICKSTART_NAME -e RELEASE_STRATEGY -e RESET_ENVIRONMENT -e TEST_SUITE \
          -e ZABBIX_ENABLED -e ZABBIX_HOST -e ZABBIX_METRIC_PREFIX \
          -e ZABBIX_PORT -e ZABBIX_SERVER \
          --network="host" -t -v "$(pwd)/dist:/dist:Z" \
          -v /etc/localtime:/etc/localtime:ro \
          -v "$PWD/jenkins-env:/opt/fabric8-test/jenkins-env" "$REGISTRY/$REPOSITORY/$TEST_IMAGE:latest"

# Start Xvfb
docker exec "$TEST_CONTAINER_NAME" /usr/bin/Xvfb :99 -screen 0 1024x768x24 &

# Exec EE tests
docker exec "$TEST_CONTAINER_NAME" ./ts-protractor.sh "$TEST_SUITE" | tee "$ARTIFACTS_DIR/protractor.log"

# Writing to and the grepping results required as webdriver fails
# intermittently - which results is failure reported even if tests pass

# We do not want to see any TimeoutError in the log
# as protractor does not trap these as errors
grep "TimeoutError" "$ARTIFACTS_DIR/protractor.log"
ret1=$?

# We do want to see that zero specs have failed
grep "0 failures" "$ARTIFACTS_DIR/protractor.log"
ret2=$?

if [ $ret1 -eq 1 ] && [ $ret2 -eq 0 ]; then RTN_CODE=0; else RTN_CODE=1; fi
### RTN_CODE=$?

# Prepare test results for archiving
docker exec "$TEST_CONTAINER_NAME" ls -l ./target/screenshots
docker cp "$TEST_CONTAINER_NAME:/opt/fabric8-test/target/screenshots/." "$ARTIFACTS_DIR"

if [ "$ZABBIX_ENABLED" = true ] ; then
    docker exec "$TEST_CONTAINER_NAME" ls -l ./target/zabbix
    docker cp "$TEST_CONTAINER_NAME:/opt/fabric8-test/target/zabbix/." "$ARTIFACTS_DIR"
fi

archive_artifacts

if [ "$ZABBIX_ENABLED" = true ] ; then
    docker exec "$TEST_CONTAINER_NAME" zabbix_sender -vv -T -i ./target/zabbix/zabbix-report.txt -z $ZABBIX_SERVER
fi

# Shutdown container if running
remove_container "$TEST_CONTAINER_NAME"
if [ ! -z $1 ]; then
    remove_container "$UI_CONTAINER_NAME"
fi

exit $RTN_CODE
