#!/bin/bash

#exit on error
set -e

# Do not reveal secrets
set +x

if [ -e "../jenkins-env" ]; then
  cat ../jenkins-env \
    | grep -E "(JENKINS_URL|GIT_BRANCH|GIT_COMMIT|BUILD_NUMBER|EE_TEST_OSIO_TOKEN|ARTIFACT_PASS)=" \
    | sed 's/^/export /g' \
    > /tmp/jenkins-env
  source /tmp/jenkins-env
fi

prod=true
# Set prod to false, to run tests on prod-preview
if [[ "$1" == "--prod-preview" ]]; then
  prod=false
fi

if $prod; then
  FABRIC8_WIT_API_URL="https://api.openshift.io/"
  USER_NAME="rgarg-osiotest1"
else
  FABRIC8_WIT_API_URL="https://api.prod-preview.openshift.io/"
  USER_NAME="osio-ci-planner-002-preview"
fi

echo installing dependency
sudo yum -y install epel-release
sudo yum -y install python2
sudo yum -y install python-pip
pip install --upgrade pip
pip install requests pytest jmespath

cd pytest
chmod +x run_me.sh
./run_me.sh $FABRIC8_WIT_API_URL $USER_NAME $EE_TEST_OSIO_TOKEN True

if grep "AssertionError" pytest_cli_logs.log; then
  echo 'API tests fail.'
  exit 1
else
  echo 'API tests pass.'
  exit 0
fi