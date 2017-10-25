#!/usr/bin/env bash

# Do not reveal secrets
set +x

# Test execution parameters - taken from env variables - define ALL of these before running test
osioUsername=$OSIO_USERNAME
osioPassword=$OSIO_PASSWORD
osioURL=$OSIO_URL
osoToken=$OSO_TOKEN
osioRefreshToken=$OSIO_REFRESH_TOKEN
osoUsername=$OSO_USERNAME
githubUsername=$GITHUB_USERNAME
testSuite=$TEST_SUITE

DIR="$(pwd)"
if [ -z "$DIR" ]; then
  DIR="."
fi

LOGFILE=${DIR}/functional_tests.log
echo Using logfile $LOGFILE 

# webdriver-manager command commented out to save time - only needed periodically
# lets make sure we use the local protractor webdriver-manager
# export PATH=node_modules/protractor/bin:$PATH

# Download dependencies
# echo -n Updating Webdriver and Selenium...
# node_modules/protractor/bin/webdriver-manager update
webdriver-manager update --versions.chrome 2.33

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
echo Running protractor test suite ${PROTRACTOR_JS} with OpenShift username $osoUsername and GitHub username $githubUsername on server $osioURL  ...

export PATH=$PATH:node_modules/protractor/bin

protractor ${PROTRACTOR_JS} --suite "${testSuite}" --params.login.user="${osioUsername}" --params.login.password="${osioPassword}" --params.target.url="${osioURL}" --params.oso.token="${osoToken}" --params.kc.token="${osioRefreshToken}" --params.github.username=${githubUsername} --params.oso.username=${osoUsername}

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

