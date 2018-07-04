#!/bin/bash
source config/config.sh

echo "Starting behave testsuite"
time behave -f allure_behave.formatter:AllureFormatter -o $REPORT_DIR --no-capture --no-capture-stderr @features_list.txt
#behave --junit --junit-directory $REPORT_DIR --no-capture-stderr --no-logcapture @features_list.txt
echo "behave testsuite COMPLETE"
