#!/bin/bash
if test ! $(which pyresttest)
then
	echo "==> check pre-requisites: python and pyresttest should be installed"
else
    echo "==> 1. Get tokens from WIT/Auth"
    tokens=$(curl 'http://localhost:8080/api/login/generate' | python -c "import sys, json; jdata = sys.stdin.read(); data = json.loads(jdata); token1 = data[0]['token']['access_token']; print token1; token2 = data[1]['token']['access_token']; print token2")
    testuser_token=$(echo $tokens | cut -d' ' -f1)
    testuser2_token=$(echo $tokens | cut -d' ' -f2)
    echo "this is token1: $testuser_token"
    echo "this is token2: $testuser2_token"

    echo "==> 2. Generate test db"
    # ./gen_planner_tests_db.sh http://localhost:8080 testuser spacename
    pyresttest null UI_automation_test_setup.yaml --vars="{'token':'$testuser_token', 'userid':'$2', 'space_name_var':'$3', 'sut':'$1'}" --absolute-urls

fi