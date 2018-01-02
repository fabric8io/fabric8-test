#!/bin/bash

# $1 = target server URL
# $2 = build number
# $3 = test suite
# $4 = github username

# Define default variables

DEFAULT_TEST_URL="https://openshift.io"
TEST_URL=${1:-$DEFAULT_TEST_URL}

DEFAULT_TEST_SUITE="runTest"
TEST_SUITE=${3:-$DEFAULT_TEST_SUITE}

DEFAULT_GITHUB_USERNAME="osiotestmachine"
GITHUB_USERNAME=${4:-$DEFAULT_GITHUB_USERNAME}

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
    | grep -E "(JENKINS_URL|GIT_BRANCH|GIT_COMMIT|BUILD_NUMBER|ghprbSourceBranch|ghprbActualCommit|BUILD_URL|ghprbPullId|EE_TEST_USERNAME|EE_TEST_PASSWORD|EE_TEST_OSO_TOKEN|EE_TEST_KC_TOKEN|ARTIFACT_PASS|TEST_SUITE|OSIO_URL|GITHUB_USERNAME)=" \
    | sed 's/^/export /g' \
    > /tmp/jenkins-env
  source /tmp/jenkins-env
fi

# We need to disable selinux for now, XXX
/usr/sbin/setenforce 0

# Get all the deps in
yum -y install \
  docker \
  make \
  git \
  rsync
service docker start

# Build builder image
cp /tmp/jenkins-env .
# User root is required to run webdriver-manager update. This shouldn't be a problem for CI containers

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
export OSO_TOKEN=$EE_TEST_OSO_TOKEN
export OSIO_URL=$TEST_URL
export OSIO_REFRESH_TOKEN=$EE_TEST_KC_TOKEN
export OSO_USERNAME=$EE_TEST_USERNAME
export GITHUB_USERNAME="osiotestmachine"
export DEBUG="true"

docker run --detach=true --name=fabric8-test --cap-add=SYS_ADMIN \
          -e OSIO_USERNAME -e OSIO_PASSWORD -e OSIO_URL -e OSO_TOKEN -e OSIO_REFRESH_TOKEN \
          -e OSO_USERNAME -e GITHUB_USERNAME -e TEST_SUITE -e DEBUG -e "API_URL=http://api.openshift.io/api/" -e ARTIFACT_PASSWORD=$ARTIFACT_PASS \
          -e "CI=true" -t -v $(pwd)/dist:/dist:Z -v $PWD/password_file:/opt/fabric8-test/password_file -v $PWD/jenkins-env:/opt/fabric8-test/jenkins-env \
          ${REGISTRY}/${REPOSITORY}/${IMAGE}:latest

docker exec fabric8-test npm install
docker exec fabric8-test npm install -g typescript

echo -n Updating Webdriver and Selenium...
docker exec fabric8-test webdriver-manager update
docker exec fabric8-test webdriver-manager update --versions.chrome 2.33

# Exec EE tests
# Writing to and the grepping results required as webdriver fails
# intermittently - which results is failure reported even if tests pass
docker exec fabric8-test sh ./local_cleanup.sh $OSO_USERNAME $OSO_TOKEN
docker exec fabric8-test ./ts-protractor.sh $TEST_SUITE | tee theLog.txt
grep "0 failures" theLog.txt
RTN_CODE=$?

# Archive test reuslts file
docker exec fabric8-test chmod 600 password_file
docker exec fabric8-test chown root password_file
docker exec fabric8-test ls -l password_file
docker exec fabric8-test ls -l ./target/screenshots

docker exec fabric8-test rsync --password-file=./password_file -PHva ./target/screenshots/my-report.html  devtools@artifacts.ci.centos.org::devtools/e2e/$2

files=`docker exec fabric8-test ls -1 ./target/screenshots`

for file in $files;
do docker exec fabric8-test rsync --password-file=./password_file -PHva ./target/screenshots/$file  devtools@artifacts.ci.centos.org::devtools/e2e/$2_$file;
done

exit $RTN_CODE


