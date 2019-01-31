#!/bin/bash
########################################################################################
# Script runs Che tests in docker image                                                #
# $1 - username                                                                        #
# $2 - password                                                                        #
# $3 - email                                                                           #
# $4 - workspace                                                                       #
########################################################################################

# stop the script when any command fails
set -e

if [[ $1 = *"preview"* ]]; then
  AUTH_SERVER_URL="https://auth.prod-preview.openshift.io"
  CHE_SERVER_URL="che.prod-preview.openshift.io"
else
  AUTH_SERVER_URL="https://auth.openshift.io"
  CHE_SERVER_URL="che.openshift.io"
fi

# Shutdown container if running
if [ -n "$(docker ps -qa -f  name=functional-tests-dep)" ]; then
    docker rm -f functional-tests-dep
fi

if [ -n "$(docker ps -qa -f  name=f8-test-volume-container)" ]; then
    docker rm -f f8-test-volume-container
fi

# Delete volume if exists
if [ -n "$(docker volume ls | grep f8-test-volume)" ]; then
    docker volume rm f8-test-volume
fi

# Pull the latest Docker image
docker pull quay.io/openshiftio/rhchestage-rh-che-functional-tests-dep:latest

# Create volume
docker volume create f8-test-volume

# do not stop the script when docker run fails to allow archiving of artifacts
set +e

docker run --name functional-tests-dep --privileged \
	-v  /var/run/docker.sock:/var/run/docker.sock \
	-v  f8-test-volume:/root/logs \
	-e "RHCHE_SCREENSHOTS_DIR=/root/logs/screenshots" \
	-e "RHCHE_ACC_USERNAME=$1" \
	-e "RHCHE_ACC_PASSWORD=$2" \
	-e "RHCHE_ACC_EMAIL=$3" \
	-e "RUNNING_WORKSPACE=$4" \
	-e "CHE_OSIO_AUTH_ENDPOINT=$AUTH_SERVER_URL" \
	-e "RHCHE_HOST_URL=$CHE_SERVER_URL" \
	-e "TEST_SUITE=e2eTestSuite.xml" \
	quay.io/openshiftio/rhchestage-rh-che-functional-tests-dep:latest

RETURN_CODE=$?

# stop the script when any command fails
set -e

# Copy data from volume
docker run -d -t --name f8-test-volume-container \
	-v f8-test-volume:/data centos

docker cp f8-test-volume-container:/data/. target

# Shutdown container if running
if [ -n "$(docker ps -qa -f  name=functional-tests-dep)" ]; then
    docker rm -f functional-tests-dep
fi

if [ -n "$(docker ps -qa -f  name=f8-test-volume-container)" ]; then
    docker rm -f f8-test-volume-container
fi

# Delete volume if exists
if [ -n "$(docker volume ls | grep f8-test-volume)" ]; then
    docker volume rm f8-test-volume
fi

exit $RETURN_CODE