#!/bin/bash

# Exit on error
set -e

# Export needed vars
set +x
for var in BUILD_NUMBER DEVSHIFT_USERNAME DEVSHIFT_PASSWORD QUAY_USERNAME QUAY_PASSWORD; do
  export "$(grep ${var} ../jenkins-env | xargs)"
done
set -x

if [ -n "$BUILD_NUMBER" ]; then
  # We need to disable selinux for now, XXX
  /usr/sbin/setenforce 0

  # Get all the deps in
  yum -y install docker
  yum clean all
  service docker start
fi

IMAGE="fabric8-e2e-tests"

# Build image
docker build -t "$IMAGE" -f Dockerfile.builder .

if [ ! $? -eq 0 ]; then
  echo 'CICO: Image build failed'
  exit 1
fi
echo 'CICO: Build OK'

# returns something like "Google Chrome 66.0.3359.117" when using Chrome stable
# returns something like "Google Chrome 67.0.3396.18 beta" when using Chrome beta
TMP=$(docker run --rm fabric8-test google-chrome --version)
# convert to array of words
IFS=" " read -r -a TMP <<< "$TMP"

# 3 for stable channel, 4 for beta channel
if [ ! ${#TMP[*]} -eq 3 ]; then
  echo "CICO: The output of command 'google-chrome --version' probably changed, update this script";
  exit 2
fi
TAG=${TMP[2]}

if [ -z "$BUILD_NUMBER" ]; then
  exit 0
fi

if [ -n "$DEVSHIFT_USERNAME" ] && [ -n "$DEVSHIFT_PASSWORD" ]; then
  REGISTRY="push.registry.devshift.net"
  REPOSITORY="fabric8io"
  DEVSHIFT_IMAGE="fabric8-test"
  docker login -u "$DEVSHIFT_USERNAME" -p "$DEVSHIFT_PASSWORD" "$REGISTRY"
fi

docker tag "$IMAGE" "$REGISTRY/$REPOSITORY/$DEVSHIFT_IMAGE:latest" && \
docker tag "$IMAGE" "$REGISTRY/$REPOSITORY/$DEVSHIFT_IMAGE:$TAG" && \
docker push "$REGISTRY/$REPOSITORY/$DEVSHIFT_IMAGE:latest" && \
docker push "$REGISTRY/$REPOSITORY/$DEVSHIFT_IMAGE:$TAG"

if [ -n "${QUAY_USERNAME}" -a -n "${QUAY_PASSWORD}" ]; then
  REGISTRY="quay.io"
  REPOSITORY="openshiftio"
  docker login -u "${QUAY_USERNAME}" -p "${QUAY_PASSWORD}" "$REGISTRY"
else
  echo "ERROR: Can not push to $REGISTRY: credentials are not set. Aborting"
  exit 3
fi

docker tag "$IMAGE" "$REGISTRY/$REPOSITORY/$IMAGE:latest" && \
docker tag "$IMAGE" "$REGISTRY/$REPOSITORY/$IMAGE:$TAG" && \
docker push "$REGISTRY/$REPOSITORY/$IMAGE:latest" && \
docker push "$REGISTRY/$REPOSITORY/$IMAGE:$TAG"

echo 'CICO: Image pushed to the registry'
