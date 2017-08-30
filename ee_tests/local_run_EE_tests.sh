#!/usr/bin/env bash

set -x

LOGFILE=$(pwd)/functional_tests.log
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
while ! (nc -w 1 127.0.0.1 4444 </dev/null >/dev/null 2>&1); do sleep 1; done
echo done.

# Finally run protractor
echo Running tests...
#node_modules/protractor/bin/protractor protractorEE.config.js --suite setupTest --params.login.user=$1 --params.login.password=$2 --params.target.url=$3 --params.oso.token=$4 --params.kc.token=$5

node_modules/protractor/bin/protractor protractorEE.config.js --suite runTest --params.login.user=$1 --params.login.password=$2 --params.target.url=$3 --params.oso.token=$4 --params.kc.token=$5
TEST_RESULT=$?

# cat log file to stdout 
# cat $LOGFILE

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

