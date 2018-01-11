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

DEFAULT_TEST_SUITE="runTest"
TEST_SUITE=${6:-$DEFAULT_TEST_SUITE}

echo "Running the E2E tests using fabric8-test-ee image as login user ${USERNAME} OpenShift User ${OSO_USERNAME} with on console URL: ${TARGET_URL} platform: ${TEST_PLATFORM} quickstart: ${QUICKSTART}"


DIR="$(pwd)"
if [ -z "$DIR" ]; then
  DIR="."
fi

LOGFILE=${DIR}/functional_tests.log

echo Using logfile $LOGFILE

# Start selenium server just for this test run
echo -n Starting Webdriver and Selenium...
(webdriver-manager start --versions.chrome 2.33 >>$LOGFILE 2>&1 &)

# Wait for port 4444 to be listening connections
##### while ! (nc -w 1 127.0.0.1 4444 </dev/null >/dev/null 2>&1); do sleep 1; done
until curl --output /dev/null --silent --head --fail 127.0.0.1:4444; do sleep 1; done
echo done.

PROTRACTOR_JS="$PROTRACTOR_CONFIG_JS"
if [ -z "$PROTRACTOR_JS" ]; then
  PROTRACTOR_JS="protractorEE.config.js"
fi

# Finally run protractor
echo Running protractor test suite ${PROTRACTOR_JS} with OpenShift username $OSO_USERNAME and GitHub username $GITHUB_USERNAME  ...

export PATH=$PATH:node_modules/protractor/bin

## we should not list tokens or passwords on the command line to avoid them appearing in output logs!

protractor ${PROTRACTOR_JS} --suite "${TEST_SUITE}"

TEST_RESULT=$?

# cat log file to stdout
if [ "$CAT_LOGFILE" == "true" ]; then
  echo
  echo "------------------------------------------"
  echo "Log file:"
  cat $LOGFILE
  echo "------------------------------------------"
  echo
fi

# Cleanup webdriver-manager and web app processes
fuser -k -n tcp 4444
fuser -k -n tcp 8088

# Return test result
if [ $TEST_RESULT -eq 0 ]; then
  echo 'Notice - Functional tests OK'
  exit 0
else
  echo 'Notice - Functional tests FAIL'
  exit 1
fi



