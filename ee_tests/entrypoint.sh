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

## ******************************************************************
## Added January 11, 2018
## To switch the tests to use the new Typescript tests

TEST_SUITE="runTest"

# Assign values to variable names expected by typescript testsmore 
export OSIO_USERNAME=$USERNAME
export OSIO_PASSWORD=$PASSWORD
## export OSO_TOKEN=$EE_TEST_OSO_TOKEN
export OSIO_URL=$TARGET_URL
## export OSIO_REFRESH_TOKEN=$EE_TEST_KC_TOKEN
export OSO_USERNAME=$OSO_USERNAME
export GITHUB_USERNAME=$GITHUB_USERNAME
export DEBUG="true"
export TEST_SUITE="runTest"
export QUICKSTART_NAME="vertxHttp"

npm install
npm install -g typescript

echo -n Updating Webdriver and Selenium...
webdriver-manager update
webdriver-manager update --versions.chrome 2.33

./ts-protractor.sh $TEST_SUITE | tee theLog.txt
# Writing to and the grepping results required as webdriver fails
# intermittently - which results is failure reported even if tests pass

# We do not want to see any TimeoutError in the log 
# as protractor does not trap these as errors
grep "TimeoutError" theLog.txt
ret1=$?

# We do want to see that zero specs have failed
grep "0 failures" theLog.txt
ret2=$?

if [ $ret1 -eq 1 -a $ret2 -eq 0 ]; then TEST_RESULT=0; else TEST_RESULT=1; fi

## ******************************************************************

## protractor ${PROTRACTOR_JS} --suite "${TEST_SUITE}"

TEST_RESULT=$?

## # cat log file to stdout
## if [ "$CAT_LOGFILE" == "true" ]; then
##   echo
##   echo "------------------------------------------"
##   echo "Log file:"
##   cat $LOGFILE
##   echo "------------------------------------------"
##   echo
## fi
##
## # Cleanup webdriver-manager and web app processes
## fuser -k -n tcp 4444
## fuser -k -n tcp 8088

# Return test result
if [ $TEST_RESULT -eq 0 ]; then
  echo 'Notice - Functional tests OK'
  exit 0
else
  echo 'Notice - Functional tests FAIL'
  exit 1
fi



