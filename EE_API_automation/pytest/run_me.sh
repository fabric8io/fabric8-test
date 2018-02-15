#!/bin/bash
JENKINSLOG=$(pwd)/pytest_junit_logs.xml
CLILOG=$(pwd)/pytest_cli_logs.log
echo ""
echo Using logfile $JENKINSLOG and $CLILOG
echo ""
if test ! $(which pytest)
then
	echo "==> check pre-requisites: python and pytest should be installed"
else
    echo "==> Run API tests and generate Planner test Db"
    if [ -z "$1" ] 
        then
            echo "No System Under Test (SUT) supplied. By Default, will run against production!"
    elif [ -z "$2" ] 
        then
            echo "No USERID supplied. By Default, will run using the default test userid!"
    elif [ -z "$3" ] 
        then
            echo "No OFFLINE_TOKEN supplied. Tests cannot run against production!"
            exit;
    else
        echo "==> Launching the tests...."
        echo ""
        cd src/
        pytest -s --junitxml=$JENKINSLOG --sut=$1 --userid=$2 --offline_token=$3 2>&1 | tee -a $CLILOG
    fi
fi