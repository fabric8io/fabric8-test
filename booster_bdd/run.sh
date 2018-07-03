#!/bin/bash
source config/config.sh

echo "Starting behave testsuite"

behave -f allure_behave.formatter:AllureFormatter -o $REPORT_DIR --no-capture --no-capture-stderr @features_list.txt

echo "behave testsuite COMPLETE"
