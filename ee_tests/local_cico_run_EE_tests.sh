#!/bin/bash

# Show command before executing
set -x

# Stop on error
set -e

# Build builder image
docker build -t fabric8-ui-builder -f Dockerfile.builder .
# User root is required to run webdriver-manager update. This shouldn't be a problem for CI containers
mkdir -p dist && docker run --detach=true --name=fabric8-ui-builder --user=root --cap-add=SYS_ADMIN -e OSIO_USERNAME -e OSIO_PASSWORD -e OSIO_URL -e OSO_TOKEN -e OSIO_REFRESH_TOKEN -e OSO_USERNAME -e GITHUB_USERNAME -e TEST_SUITE -e "API_URL=http://api.openshift.io/api/" -e "CI=true" -t -v $(pwd)/dist:/dist:Z fabric8-ui-builder

# Build 

docker exec fabric8-ui-builder npm install
docker exec fabric8-ui-builder npm install -g typescript
docker exec fabric8-ui-builder npm run webdriver:update

# Clean up the test user account's resources in OpenShift Online

docker exec fabric8-ui-builder wget https://github.com/openshift/origin/releases/download/v1.5.0/openshift-origin-client-tools-v1.5.0-031cbe4-linux-64bit.tar.gz
docker exec fabric8-ui-builder tar -xzvf openshift-origin-client-tools-v1.5.0-031cbe4-linux-64bit.tar.gz
docker exec fabric8-ui-builder mv openshift-origin-client-tools-v1.5.0-031cbe4-linux-64bit/oc oc

# Exec EE tests
### docker exec fabric8-ui-builder ./local_run_EE_tests.sh 
docker exec fabric8-ui-builder ./ts-protractor.sh

# Test results to archive
docker cp fabric8-ui-builder:/home/fabric8/fabric8-ui/target/ .
docker cp fabric8-ui-builder:/home/fabric8/fabric8-ui/functional_tests.log target






