#!/bin/bash

# $1 = target server URL
# $2 = build number
# $3 = test suite
# $4 = github username
# $5 = quickstart name
# $6 = release strategy
# $7 = feature level
# $8 = enable zabbix reporting
# $9 = zabbix host

# Define default variables

DEFAULT_TEST_URL="https://openshift.io"
TEST_URL=${1:-$DEFAULT_TEST_URL}

DEFAULT_TEST_SUITE="runTest"
TEST_SUITE=${3:-$DEFAULT_TEST_SUITE}

DEFAULT_GITHUB_USERNAME="osiotestmachine"
GITHUB_USERNAME=${4:-$DEFAULT_GITHUB_USERNAME}

DEFAULT_QUICKSTART_NAME="vertxHttp"
QUICKSTART_NAME=${5:-$DEFAULT_QUICKSTART_NAME}

DEFAULT_RELEASE_STRATEGY="releaseStageApproveAndPromote"
RELEASE_STRATEGY=${6:-$DEFAULT_RELEASE_STRATEGY}

DEFAULT_FEATURE_LEVEL="released"
FEATURE_LEVEL=${7:-$DEFAULT_FEATURE_LEVEL}

ZABBIX_ENABLED=${8:-"true"}

ZABBIX_HOST=${9:-"unknown"}

DEFAULT_GITHUB_REPO=""
GITHUB_REPO=${10:-$DEFAULT_GITHUB_REPO}

# Do not reveal secrets
set +x

# Do not exit on failure so that artifacts can be archived
set +e

# Setup password used to rsync/archive test reuslts file
cp ../artifacts.key ./password_file
chmod 600 ./password_file

# Source environment variables of the jenkins slave
# that might interest this worker.
if [ -e "../jenkins-env" ]; then
  cat ../jenkins-env \
    | grep -E "(JENKINS_URL|GIT_BRANCH|GIT_COMMIT|JOB_NAME|BUILD_NUMBER|ghprbSourceBranch|ghprbActualCommit|BUILD_URL|ghprbPullId|EE_TEST_USERNAME|EE_TEST_PASSWORD|ARTIFACT_PASS|TEST_SUITE|OSIO_URL|GITHUB_USERNAME|GITHUB_REPO|QUICKSTART_NAME|RELEASE_STRATEGY)=" \
    | sed 's/^/export /g' \
    > /tmp/jenkins-env
  source /tmp/jenkins-env
fi

# We need to disable selinux for now, XXX
/usr/sbin/setenforce 0

# Get all the deps in
yum -y install docker
service docker start

# Build builder image
cp /tmp/jenkins-env .

IMAGE="fabric8-test"
REPOSITORY="fabric8io"
REGISTRY="registry.devshift.net"

mkdir -p dist
echo "Pull fabric8-test image"
docker pull ${REGISTRY}/${REPOSITORY}/${IMAGE}:latest
echo "Run test container"

# Assign values to variable names expected by typescript testsmore
export OSIO_USERNAME=$EE_TEST_USERNAME
export OSIO_PASSWORD=$EE_TEST_PASSWORD
export OSIO_URL=$TEST_URL
export OSO_USERNAME=$EE_TEST_USERNAME
export GITHUB_USERNAME=$GITHUB_USERNAME
export GITHUB_REPO="$GITHUB_REPO"
export DEBUG="true"
export QUICKSTART_NAME=$QUICKSTART_NAME
export RELEASE_STRATEGY=$RELEASE_STRATEGY
export RESET_ENVIRONMENT="true"
export FEATURE_LEVEL=$FEATURE_LEVEL
export ZABBIX_ENABLED=$ZABBIX_ENABLED
export ZABBIX_HOST=$ZABBIX_HOST
export ZABBIX_METRIC_PREFIX=$FEATURE_LEVEL

export CONTAINER_NAME=$JOB_NAME;
echo "Container name: $CONTAINER_NAME"

# Shutdown container if running
if [ -n "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
    docker rm -f $CONTAINER_NAME
fi

docker run --shm-size=256m --detach=true --name=$CONTAINER_NAME --cap-add=SYS_ADMIN \
          -e OSIO_USERNAME -e OSIO_PASSWORD -e OSIO_URL -e OSO_USERNAME -e GITHUB_USERNAME -e GITHUB_REPO \
          -e TEST_SUITE -e QUICKSTART_NAME -e RELEASE_STRATEGY -e FEATURE_LEVEL -e DEBUG -e "API_URL=http://api.openshift.io/api/" \
          -e ARTIFACT_PASSWORD=$ARTIFACT_PASS -e BUILD_NUMBER -e JOB_NAME -e RESET_ENVIRONMENT \
          -e ZABBIX_ENABLED -e ZABBIX_HOST -e ZABBIX_METRIC_PREFIX \
          -e "CI=true" -t -v $(pwd)/dist:/dist:Z -v $PWD/password_file:/opt/fabric8-test/password_file \
          -v $PWD/jenkins-env:/opt/fabric8-test/jenkins-env ${REGISTRY}/${REPOSITORY}/${IMAGE}:latest

# Start Xvfb
docker exec $CONTAINER_NAME /usr/bin/Xvfb :99 -screen 0 1024x768x24 &

# Exec EE tests
docker exec $CONTAINER_NAME ./ts-protractor.sh $TEST_SUITE | tee theLog.txt

# Writing to and the grepping results required as webdriver fails
# intermittently - which results is failure reported even if tests pass

# We do not want to see any TimeoutError in the log
# as protractor does not trap these as errors
grep "TimeoutError" theLog.txt
ret1=$?

# We do want to see that zero specs have failed
grep "0 failures" theLog.txt
ret2=$?

if [ $ret1 -eq 1 -a $ret2 -eq 0 ]; then RTN_CODE=0; else RTN_CODE=1; fi
### RTN_CODE=$?

# Archive test results file
docker exec $CONTAINER_NAME chmod 600 password_file
docker exec $CONTAINER_NAME chown root password_file
docker exec $CONTAINER_NAME ls -l password_file
docker exec $CONTAINER_NAME ls -l ./target/screenshots
docker exec $CONTAINER_NAME ls -l ./target/zabbix

docker exec $CONTAINER_NAME mkdir -p ./e2e/${JOB_NAME}/${BUILD_NUMBER}
docker exec $CONTAINER_NAME bash -c 'cp ./target/screenshots/* ./e2e/${JOB_NAME}/${BUILD_NUMBER}'
docker exec $CONTAINER_NAME bash -c 'cp ./target/zabbix/* ./e2e/${JOB_NAME}/${BUILD_NUMBER}'
docker exec $CONTAINER_NAME rsync --password-file=./password_file -PHva --relative ./e2e/${JOB_NAME}/${BUILD_NUMBER}  devtools@artifacts.ci.centos.org::devtools/

# Shutdown container if running
if [ -n "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
    docker rm -f $CONTAINER_NAME
fi

# Set build as unstable if tests have failed
if [ $RTN_CODE -eq 1 ]; then 
  echo "Tests failed; setting build as unstable"
  wget ${JENKINS_URL}jnlpJars/jenkins-cli.jar 
  java -jar jenkins-cli.jar set-build-result unstable && exit 0
fi

exit $RTN_CODE
