#!/bin/bash
CONFIG=${1:-config}
CONFIG_FILE="config/$CONFIG.sh"

echo "Reading configuration from: $CONFIG_FILE"
source "$CONFIG_FILE"

echo "Starting behave testsuite"

behave -f allure_behave.formatter:AllureFormatter -o "$REPORT_DIR" --no-capture --no-capture-stderr @features_list.txt

echo "behave testsuite COMPLETE"
