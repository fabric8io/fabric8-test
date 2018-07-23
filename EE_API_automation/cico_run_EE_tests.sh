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

echo installing dependency
sudo yum -y --quiet install epel-release
sudo yum -y --quiet install python2
sudo yum -y --quiet install python-pip
pip install --quiet --upgrade pip
pip install --quiet requests pytest jmespath

cd pytest
chmod +x run_me.sh
./run_me.sh 'https://api.openshift.io/' 'rgarg-osiotest1' $EE_TEST_OSIO_TOKEN True

if grep "AssertionError" pytest_cli_logs.log; then
  echo 'API tests fail.'
  exit 1
else
  echo 'API tests pass.'
  exit 0
fi
