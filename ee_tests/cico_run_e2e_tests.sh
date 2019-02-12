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

function archive_artifacts {
    ARTIFACTS_KEY="../../config/artifacts.key"
    chmod 600 "$ARTIFACTS_KEY"
    chown root:root "$ARTIFACTS_KEY"
    rsync --password-file="$ARTIFACTS_KEY" -qPHvar --relative "./$ARTIFACTS_DIR" devtools@artifacts.ci.centos.org::devtools/
    echo "Artifacts were uploaded to http://artifacts.ci.centos.org/devtools/$ARTIFACTS_DIR"
}

function start_fabric8_ui {
    export UI_CONTAINER_NAME="ui-$JOB_NAME"
    remove_container "$UI_CONTAINER_NAME"
    DIR="$( cd "$(dirname "${BASH_SOURCE[0]}" )" && pwd)"
    START_UI_LOG="$ARTIFACTS_DIR/start_fabric8_ui.log"

    docker build -t "$UI_CONTAINER_NAME" -f "$DIR/../../fabric8-ui/Dockerfile.builder" \
        "$DIR/../../fabric8-ui" | tee -a "$START_UI_LOG"

    docker run --detach=true --name="$UI_CONTAINER_NAME" -t --network="host" \
        -v $(pwd)/dist:/dist:Z -P  "$UI_CONTAINER_NAME" | tee -a "$START_UI_LOG"

    docker exec "$UI_CONTAINER_NAME" npm install | tee -a "$START_UI_LOG"
    docker exec "$UI_CONTAINER_NAME" npm run bootstrap | tee -a "$START_UI_LOG"
    docker exec "$UI_CONTAINER_NAME" npm run build --prefix packages/toolchain  | tee -a "$START_UI_LOG"

    docker exec "$UI_CONTAINER_NAME" /bin/bash -c \
        "source environments/openshift-prod-preview-cluster.sh && \
        npm run prod --prefix packages/toolchain" | tee -a "$START_UI_LOG" &

    # Wait for fabric8-ui to compile all modules and start the server
    i=1
    while [ $i -le 5 ]; do
        curl -I -X GET $OSIO_URL
        if [ ! $? -eq 0 ]; then
            if [ $i -eq 5 ]; then
                echo "Fabric8 UI did not start in more than 5 minutes"
                archive_artifacts
                echo "See http://artifacts.ci.centos.org/devtools/$START_UI_LOG for why Fabric8 UI did not start"
                remove_container "$UI_CONTAINER_NAME"
                exit 5
            fi
            sleep 60
            ((i++))
        else
            break
        fi
    done
}

# Do not reveal secrets
set +x

# Source environment variables of the jenkins slave
# that might interest this worker.
if [ -e "../../config/jenkins-env" ]; then
  grep -E "(JENKINS_URL|GIT_BRANCH|GIT_COMMIT|JOB_NAME|BUILD_NUMBER|ghprbSourceBranch|\
  |ghprbActualCommit|BUILD_URL|ghprbPullId|RESET_ENVIRONMENT|\
  |OSIO_CLUSTER|OSIO_USERNAME|OSIO_PASSWORD|TEST_SUITE|OSIO_URL|GITHUB_USERNAME|GITHUB_REPO|\
  |QUICKSTART_NAME|RELEASE_STRATEGY|FEATURE_LEVEL|ZABBIX_ENABLED)=" ../../config/jenkins-env \
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

mkdir -p "$ARTIFACTS_DIR"

# Get all the deps in
time yum -y install docker > "$ARTIFACTS_DIR/yum_install.log"
service docker start

cp /tmp/jenkins-env .

if [ ! -z $1 ]; then
    start_fabric8_ui
fi

# Do not exit on failure so that artifacts can be archived
set +e

TEST_IMAGE="fabric8-e2e-tests"
REPOSITORY="openshiftio"
REGISTRY="quay.io"

echo "Pull $TEST_IMAGE image"
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
          --network="host" -t \
          -v /etc/localtime:/etc/localtime:ro \
          -v /var/run/docker.sock:/var/run/docker.sock \
          -v "$PWD/jenkins-env:/opt/fabric8-test/jenkins-env" "$REGISTRY/$REPOSITORY/$TEST_IMAGE:latest"

# Start Xvfb
docker exec "$TEST_CONTAINER_NAME" /usr/bin/Xvfb :99 -screen 0 1024x768x24 &

# Exec EE tests
docker exec "$TEST_CONTAINER_NAME" ./ts-protractor.sh | tee "$ARTIFACTS_DIR/protractor.log"

RTN_CODE=$?

# Prepare test results for archiving
docker exec "$TEST_CONTAINER_NAME" ls -l ./target/screenshots
docker cp "$TEST_CONTAINER_NAME:/opt/fabric8-test/target/screenshots/." "$ARTIFACTS_DIR"

if [ "$ZABBIX_ENABLED" = true ] ; then
    docker exec "$TEST_CONTAINER_NAME" ls -l ./target/zabbix
    docker cp "$TEST_CONTAINER_NAME:/opt/fabric8-test/target/zabbix/." "$ARTIFACTS_DIR"
fi

if [[ "$TEST_SUITE" = "che" ]]; then
    mkdir -p "$ARTIFACTS_DIR"/che/failsafe
    docker exec "$TEST_CONTAINER_NAME" ls -l ./target/artifacts
    docker exec "$TEST_CONTAINER_NAME" ls -l ./target/artifacts/failsafe-reports
    docker exec "$TEST_CONTAINER_NAME" ls -l ./target/artifacts/screenshots
    docker cp "$TEST_CONTAINER_NAME:/opt/fabric8-test/target/artifacts/failsafe-reports/." "$ARTIFACTS_DIR"/che/failsafe
    docker cp "$TEST_CONTAINER_NAME:/opt/fabric8-test/target/artifacts/screenshots/." "$ARTIFACTS_DIR"/che
    docker cp "$TEST_CONTAINER_NAME:/opt/fabric8-test/target/functional-tests.log" "$ARTIFACTS_DIR"/che
    docker cp "$TEST_CONTAINER_NAME:/opt/fabric8-test/target/che-starter.log" "$ARTIFACTS_DIR"/che
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
