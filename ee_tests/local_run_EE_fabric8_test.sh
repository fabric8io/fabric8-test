#!/usr/bin/env bash

echo "Running the E2E tests locally against fabric8 on minishift"

export TEST_PLATFORM="fabric8-openshift"
export TEST_QUICKSTART="Vert.x - Basic"
export DISABLE_CHE_CHECKS="true"


export PROTRACTOR_CONFIG_JS="protractorEE-fabric8.config.js"

# optional
export OS_USERNAME="developer"
export OS_PASSWORD="developer"

./local_run_EE_tests.sh $*
