#!/bin/bash

# Exit on error
set -e

# Export needed vars
set +x
for var in BUILD_NUMBER BUILD_URL JENKINS_URL GIT_BRANCH GH_TOKEN NPM_TOKEN GIT_COMMIT DEVSHIFT; do
  export $(grep ${var} ../jenkins-env | xargs)
done
export BUILD_TIMESTAMP=`date -u +%Y-%m-%dT%H:%M:%S`+00:00
set -x

if [ -n "${BUILD_NUMBER}" ]; then
  # We need to disable selinux for now, XXX
  /usr/sbin/setenforce 0

  # Get all the deps in
  yum -y install docker
  yum clean all
  service docker start
fi

IMAGE="fabric8-test"
REPOSITORY="fabric8io"
REGISTRY="push.registry.devshift.net"

# Build image
docker build -t ${IMAGE} -f Dockerfile.builder .

if [ ! $? -eq 0 ]; then
  echo 'CICO: Image build failed'
  exit 1
fi
echo 'CICO: Build OK'

if [ -z "${BUILD_NUMBER}" ]; then
  exit 0
fi

# returns something like "Google Chrome 66.0.3359.117"
TMP=`docker run --rm fabric8-test google-chrome --version`
# convert to array of words
TMP=($TMP)
if [ ! ${#TMP[*]} -eq 3 ]; then
  echo "CICO: The output of command 'google-chrome --version' probably changed, update this script";
  exit 2
fi
TAG=${TMP[2]}

if [ -n "${DEVSHIFT_USERNAME}" ] && [ -n "${DEVSHIFT_PASSWORD}" ]; then
  docker login -u ${DEVSHIFT_USERNAME} -p ${DEVSHIFT_PASSWORD} ${REGISTRY}
fi

docker tag ${IMAGE} ${REGISTRY}/${REPOSITORY}/${IMAGE}:latest && \
docker tag ${IMAGE} ${REGISTRY}/${REPOSITORY}/${IMAGE}:${TAG} && \
docker push ${REGISTRY}/${REPOSITORY}/${IMAGE}:latest && \
docker push ${REGISTRY}/${REPOSITORY}/${IMAGE}:${TAG}

if [ $? -eq 0 ]; then
  echo 'CICO: Image pushed, ready to update deployed app'
  exit 0
else
  echo 'CICO: Image push to registry failed'
  exit 3
fi
