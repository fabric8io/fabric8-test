#!/bin/bash

set +e

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
sudo yum -y install python2 python2-pytest python2-requests python2-jmespath

cd pytest
chmod +x run_me.sh
./run_me.sh 'https://api.openshift.io/' 'rgarg-osiotest1' $EE_TEST_OSIO_TOKEN
