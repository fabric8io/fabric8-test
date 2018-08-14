#!/bin/bash

# set bash vars
set -euo pipefail
# Do not reveal secrets
set +x

if [ -e "../jenkins-env" ]; then
  cat ../jenkins-env \
    | grep -E "(JENKINS_URL|GIT_BRANCH|GIT_COMMIT|BUILD_NUMBER|EE_TEST_OSIO_TOKEN|ARTIFACT_PASS)=" \
    | sed 's/^/export /g' \
    > /tmp/jenkins-env
  source /tmp/jenkins-env
fi

EE_TEST_OSIO_TOKEN=None
FABRIC8_E2E_TEST_DIR="tmp/fabric8-test"

FABRIC8_WIT_API_URL="http://localhost:8080"
USER_NAME="developer"

echo installing dependency
sudo yum -y --quiet install epel-release python-devel gcc
sudo yum -y --quiet install python2
sudo yum -y --quiet install python-pip
pip install --quiet --upgrade pip
pip install --quiet requests pytest jmespath

cd $FABRIC8_E2E_TEST_DIR/EE_API_automation/pytest
chmod +x run_me.sh
./run_me.sh $FABRIC8_WIT_API_URL $USER_NAME $EE_TEST_OSIO_TOKEN True || exit 1
