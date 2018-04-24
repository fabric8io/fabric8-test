#!/usr/bin/env bash

## ******************************************************************
## Added January 11, 2018
## To switch the tests to use the new Typescript tests

/usr/bin/Xvfb :99 -screen 0 1024x768x24 &

cd /test/ee_tests
export PATH=/test/ee_tests/node_modules/protractor/bin:$PATH:/test/ee_tests:.

/usr/bin/Xvfb :99 -screen 0 1024x768x24 &

DIR="$(pwd)"
if [ -z "$DIR" ]; then
  DIR="."
fi

LOGFILE=${DIR}/functional_tests.log
echo Using logfile $LOGFILE

# Start selenium server just for this test run
echo -n Starting Webdriver and Selenium...
(webdriver-manager start --versions.chrome 2.33 >>$LOGFILE 2>&1 &)

TEST_SUITE="runTest"

# Assign values to variable names expected by typescript testsmore 
export OSIO_USERNAME=$USERNAME
export OSIO_PASSWORD=$PASSWORD
export OSIO_URL=$TARGET_URL
export OSO_USERNAME=$OSO_USERNAME
export GITHUB_USERNAME=$GITHUB_USERNAME
export DEBUG="true"
export TEST_SUITE="runTest"
export QUICKSTART_NAME="vertxHttp"
export RELEASE_STRATEGY="releaseStageApproveAndPromote"
export FEATURE_LEVEL="production"

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

# Return test result
if [ $TEST_RESULT -eq 0 ]; then
  echo 'Notice - Functional tests OK'
  exit 0
else
  echo 'Notice - Functional tests FAIL'
  exit 1
fi



