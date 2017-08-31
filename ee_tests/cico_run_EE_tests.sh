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
    | grep -E "(JENKINS_URL|GIT_BRANCH|GIT_COMMIT|BUILD_NUMBER|ghprbSourceBranch|ghprbActualCommit|BUILD_URL|ghprbPullId|EE_TEST_USERNAME|EE_TEST_PASSWORD|EE_TEST_OSO_TOKEN|EE_TEST_KC_TOKEN|ARTIFACT_PASS)=" \
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
docker run --detach=true --name=fabric8-test --cap-add=SYS_ADMIN \
          -e EE_TEST_USERNAME=$EE_TEST_USERNAME -e EE_TEST_PASSWORD=$EE_TEST_PASSWORD -e EE_TEST_OSO_TOKEN=$EE_TEST_OSO_TOKEN \
          -e EE_TEST_KC_TOKEN=$EE_TEST_KC_TOKEN -e "API_URL=http://api.openshift.io/api/" -e ARTIFACT_PASSWORD=$ARTIFACT_PASS \
          -e "CI=true" -t -v $(pwd)/dist:/dist:Z ${REGISTRY}/${REPOSITORY}/${IMAGE}:latest \
          -v $PWD/password_file:/opt/fabric8-test/ee_tests/password_file

echo -n Updating Webdriver and Selenium...
docker exec fabric8-test webdriver-manager update
docker exec fabric8-test webdriver-manager update --versions.chrome 2.29

# Exec EE tests
docker exec fabric8-test ./run_EE_tests.sh $1
RTN_CODE=$?

# Archive test reuslts file
docker exec fabric8-test chmod 600 password_file
docker exec fabric8-test chown root password_file
docker exec fabric8-test ls -l password_file
docker exec fabric8-test ls -l ./target/screenshots

docker exec fabric8-test rsync --password-file=./password_file -PHva ./target/screenshots/my-report.html  devtools@artifacts.ci.centos.org::devtools/e2e/$2

files=`docker exec fabric8-test ls -1 ./target/screenshots/*.png`

for file in $files;
do docker exec fabric8-test rsync --password-file=./password_file -PHva ./target/screenshots/$file  devtools@artifacts.ci.centos.org::devtools/e2e/$2_$file;
done

# Test results to archive - TODO - how to archive these results?
# docker cp fabric8-ui-builder:/home/fabric8/fabric8-ui/target/ .
# docker cp fabric8-ui-builder:/home/fabric8/fabric8-ui/functional_tests.log target

exit $RTN_CODE


