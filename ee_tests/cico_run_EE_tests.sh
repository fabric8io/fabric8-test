#!/bin/bash

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
    | grep -E "(JENKINS_URL|GIT_BRANCH|GIT_COMMIT|BUILD_NUMBER|ghprbSourceBranch|ghprbActualCommit|BUILD_URL|ghprbPullId|EE_TEST_USERNAME|EE_TEST_PASSWORD|EE_TEST_OSO_TOKEN|ARTIFACT_PASS)=" \
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
docker build -t fabric8-ui-builder -f Dockerfile.builder .
# User root is required to run webdriver-manager update. This shouldn't be a problem for CI containers
mkdir -p dist && docker run --detach=true --name=fabric8-ui-builder --user=root --cap-add=SYS_ADMIN -e EE_TEST_USERNAME=$EE_TEST_USERNAME -e EE_TEST_PASSWORD=$EE_TEST_PASSWORD -e EE_TEST_OSO_TOKEN=$EE_TEST_OSO_TOKEN -e "API_URL=http://api.openshift.io/api/" -e ARTIFACT_PASSWORD=$ARTIFACT_PASS -e "CI=true" -t -v $(pwd)/dist:/dist:Z fabric8-ui-builder

# Build
docker exec fabric8-ui-builder npm install

# Provide oc client to tests Clean up the test user account's resources in OpenShift Online
docker exec fabric8-ui-builder wget https://github.com/openshift/origin/releases/download/v1.5.0/openshift-origin-client-tools-v1.5.0-031cbe4-linux-64bit.tar.gz
docker exec fabric8-ui-builder tar -xzvf openshift-origin-client-tools-v1.5.0-031cbe4-linux-64bit.tar.gz
docker exec fabric8-ui-builder mv openshift-origin-client-tools-v1.5.0-031cbe4-linux-64bit/oc oc

# Exec EE tests
docker exec fabric8-ui-builder ./run_EE_tests.sh $1
RTN_CODE=$?

# Archive test reuslts file
docker exec fabric8-ui-builder chmod 600 password_file && ls -l password_file
docker exec fabric8-ui-builder ls -l ./target/screenshots/my-report.html
docker exec fabric8-ui-builder rsync --password-file=./password_file -PHva ./target/screenshots/my-report.html  devtools@artifacts.ci.centos.org::devtools/e2e/$2

# Test results to archive - TODO - how to archive these results?
# docker cp fabric8-ui-builder:/home/fabric8/fabric8-ui/target/ .
# docker cp fabric8-ui-builder:/home/fabric8/fabric8-ui/functional_tests.log target

exit $RTN_CODE


