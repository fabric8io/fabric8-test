#!/usr/bin/env bash

set -x


# Default values for parameters

DEFAULT_TEST_SUITE="runTest"
TEST_SUITE=${6:-$DEFAULT_TEST_SUITE}

DEFAULT_GITHUB_USERNAME="osiotestmachine"
GITHUB_USERNAME=${7:-$DEFAULT_GITHUB_USERNAME}

DIR="$(pwd)"
if [ -z "$DIR" ]; then
  DIR="."
fi

LOGFILE=${DIR}/functional_tests.log
echo Using logfile $LOGFILE 

# lets make sure we use the local protractor webdriver-manager
####export PATH=node_modules/protractor/bin:$PATH

# Download dependencies
#echo -n Updating Webdriver and Selenium...
#node_modules/protractor/bin/webdriver-manager update

# Start selenium server just for this test run
echo -n Starting Webdriver and Selenium...
(webdriver-manager start --versions.chrome 2.29 >>$LOGFILE 2>&1 &)

# Wait for port 4444 to be listening connections
until curl --output /dev/null --silent --head --fail 127.0.0.1:4444; do sleep 1; done
echo done.

PROTRACTOR_JS="$PROTRACTOR_CONFIG_JS"
if [ -z "$PROTRACTOR_JS" ]; then
  PROTRACTOR_JS="protractorEE.config.js"
fi

# Finally run protractor
echo Running protractor test suite ${PROTRACTOR_JS} ...
#node_modules/protractor/bin/protractor ${PROTRACTOR_JS} --suite setupTest --params.login.user=$1 --params.login.password=$2 --params.target.url=$3 --params.oso.token=$4 --params.kc.token=$5

node_modules/protractor/bin/protractor ${PROTRACTOR_JS} --suite "${TEST_SUITE}" --params.login.user="${1}" --params.login.password="${2}" --params.target.url="${3}" --params.oso.token="${4}" --params.kc.token="${5}" --params.github.username="${GITHUB_USERNAME}"

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
  echo 'Functional tests OK'
  exit 0
else
  echo 'Functional tests FAIL'
  exit 1
fi

