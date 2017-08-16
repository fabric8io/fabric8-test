#!/bin/bash

## Parameters
## $1 = OSIO username
## $2 = OSIO password
## $3 = OSIO server URL
## $4 = OpenShift web console token

# Show command before executing
set -x

set -e

# Build builder image
docker build -t fabric8-ui-builder -f Dockerfile.builder .
# User root is required to run webdriver-manager update. This shouldn't be a problem for CI containers
mkdir -p dist && docker run --detach=true --name=fabric8-ui-builder --user=root --cap-add=SYS_ADMIN -e "API_URL=http://api.openshift.io/api/" -e "CI=true" -t -v $(pwd)/dist:/dist:Z fabric8-ui-builder

# Build 
docker exec fabric8-ui-builder npm install

# Clean up the test user account's resources in OpenShift Online

docker exec fabric8-ui-builder wget https://github.com/openshift/origin/releases/download/v1.5.0/openshift-origin-client-tools-v1.5.0-031cbe4-linux-64bit.tar.gz
docker exec fabric8-ui-builder tar -xzvf openshift-origin-client-tools-v1.5.0-031cbe4-linux-64bit.tar.gz
docker exec fabric8-ui-builder mv openshift-origin-client-tools-v1.5.0-031cbe4-linux-64bit/oc oc

#docker exec fabric8-ui-builder openshift-origin-client-tools-v1.5.0-031cbe4-linux-64bit/oc login https://api.starter-us-east-2.openshift.com --token=$4
#docker exec fabric8-ui-builder openshift-origin-client-tools-v1.5.0-031cbe4-linux-64bit/oc delete all,pvc,cm,secrets,sa --all -n $1
#docker exec fabric8-ui-builder openshift-origin-client-tools-v1.5.0-031cbe4-linux-64bit/oc delete all,pvc,cm,secrets,sa --all -n $1-che
#docker exec fabric8-ui-builder openshift-origin-client-tools-v1.5.0-031cbe4-linux-64bit/oc delete all,pvc,cm,secrets,sa --all -n $1-jenkins
#docker exec fabric8-ui-builder openshift-origin-client-tools-v1.5.0-031cbe4-linux-64bit/oc delete all,pvc,cm,secrets,sa --all -n $1-run
#docker exec fabric8-ui-builder openshift-origin-client-tools-v1.5.0-031cbe4-linux-64bit/oc delete all,pvc,cm,secrets,sa --all -n $1-stage

# Exec EE tests
docker exec fabric8-ui-builder ./local_run_EE_tests.sh $1 $2 $3 $4

# Test results to archive
docker cp fabric8-ui-builder:/home/fabric8/fabric8-ui/target/ .
docker cp fabric8-ui-builder:/home/fabric8/fabric8-ui/functional_tests.log target

