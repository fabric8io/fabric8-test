#!/usr/bin/env bash

export PROTRACTOR_CONFIG_JS="protractorEE-env.config.js"
export NODE_ENV=inmemory
export TEST_PLATFORM="${TARGET_PLATFORM}"
#export CAT_LOGFILE="true"

# lets default to a single quickstart for now
if [ -z "$QUICKSTART" ]; then
  QUICKSTART="Vert.x HTTP Booster"
fi

/usr/bin/Xvfb :99 -screen 0 1024x768x24 &

cd /test/ee_tests
export PATH=/test/ee_tests/node_modules/protractor/bin:$PATH:/test/ee_tests:.

echo "Running the E2E tests using fabric8-test-ee image as user ${USERNAME} on console URL: ${TARGET_URL} platform: ${TEST_PLATFORM} quickstart: ${QUICKSTART}"

local_run_EE_tests.sh  ${USERNAME} ${PASSWORD} ${TARGET_URL} ${TOKEN}

