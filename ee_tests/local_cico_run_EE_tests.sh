#!/bin/bash

# Show command before executing
set -x

set -e

# Build builder image
docker build -t fabric8-ui-builder -f Dockerfile.builder .
# User root is required to run webdriver-manager update. This shouldn't be a problem for CI containers
mkdir -p dist && docker run --detach=true --name=fabric8-ui-builder --user=root --cap-add=SYS_ADMIN -e "API_URL=http://api.openshift.io/api/" -e "CI=true" -t -v $(pwd)/dist:/dist:Z fabric8-ui-builder

# Build 
docker exec fabric8-ui-builder npm install

# Exec EE tests
docker exec fabric8-ui-builder ./local_run_EE_tests.sh $1 $2 $3

# Test results to archive
docker cp fabric8-ui-builder:/home/fabric8/fabric8-ui/target/ .
docker cp fabric8-ui-builder:/home/fabric8/fabric8-ui/functional_tests.log target

