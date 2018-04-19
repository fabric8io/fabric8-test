#!/bin/bash

# $1 = target server URL
# $2 = build number
# $3 = test suite
# $4 = github username
# $5 = quickstart name
# $6 = release strategy

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
    | grep -E "(JENKINS_URL|GIT_BRANCH|GIT_COMMIT|JOB_NAME|BUILD_NUMBER|ghprbSourceBranch|ghprbActualCommit|BUILD_URL|ghprbPullId|EE_TEST_USERNAME|EE_TEST_PASSWORD|ARTIFACT_PASS|TEST_SUITE|OSIO_URL|GITHUB_USERNAME|QUICKSTART_NAME|RELEASE_STRATEGY)=" \
    | sed 's/^/export /g' \
    > /tmp/jenkins-env
  source /tmp/jenkins-env
fi

# We need to disable selinux for now, XXX
/usr/sbin/setenforce 0

# Get all the deps in
yum -y install \
  docker \
  rsync
service docker start

# Build builder image
cp /tmp/jenkins-env .

IMAGE="fabric8-test"
REPOSITORY="fabric8io"
REGISTRY="registry.devshift.net"

mkdir -p dist
echo "Pull fabric8-test image"
docker pull ${REGISTRY}/${REPOSITORY}/${IMAGE}:latest > /dev/null
echo "Run test container"

# Assign values to variable names expected by typescript testsmore
export OSIO_USERNAME=$EE_TEST_USERNAME
export OSIO_PASSWORD=$EE_TEST_PASSWORD
export OSIO_URL=$TEST_URL
export OSO_USERNAME=$EE_TEST_USERNAME
export GITHUB_USERNAME=$GITHUB_USERNAME
export DEBUG="true"
export QUICKSTART_NAME=$QUICKSTART_NAME
export RELEASE_STRATEGY=$RELEASE_STRATEGY
export RESET_ENVIRONMENT="true"

docker run --shm-size=256m --detach=true --name=fabric8-test --cap-add=SYS_ADMIN \
          -e OSIO_USERNAME -e OSIO_PASSWORD -e OSIO_URL -e OSO_USERNAME -e GITHUB_USERNAME \
          -e TEST_SUITE -e QUICKSTART_NAME -e RELEASE_STRATEGY -e DEBUG -e "API_URL=http://api.openshift.io/api/" \
          -e ARTIFACT_PASSWORD=$ARTIFACT_PASS -e BUILD_NUMBER -e JOB_NAME -e RESET_ENVIRONMENT \
          -e "CI=true" -t -v $(pwd)/dist:/dist:Z -v $PWD/password_file:/opt/fabric8-test/password_file \
          -v $PWD/jenkins-env:/opt/fabric8-test/jenkins-env ${REGISTRY}/${REPOSITORY}/${IMAGE}:latest

# Start Xvfb
docker exec fabric8-test /usr/bin/Xvfb :99 -screen 0 1024x768x24 &

# Exec EE tests
docker exec fabric8-test ./ts-protractor.sh $TEST_SUITE | tee theLog.txt

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
docker exec fabric8-test chmod 600 password_file
docker exec fabric8-test chown root password_file
docker exec fabric8-test ls -l password_file
docker exec fabric8-test ls -l ./target/screenshots

docker exec fabric8-test mkdir -p ./e2e/${JOB_NAME}/${BUILD_NUMBER}
docker exec fabric8-test bash -c 'cp ./target/screenshots/* ./e2e/${JOB_NAME}/${BUILD_NUMBER}'
docker exec fabric8-test rsync --password-file=./password_file -PHva --relative ./e2e/${JOB_NAME}/${BUILD_NUMBER}  devtools@artifacts.ci.centos.org::devtools/

exit $RTN_CODE
