#!/bin/bash
CONFIG=${1:-config}
CONFIG_FILE="config/$CONFIG.sh"

echo "Reading configuration from: $CONFIG_FILE"
source "$CONFIG_FILE"

echo "Removing old report directory: $REPORT_DIR"
rm -rvf "$REPORT_DIR"

if [ -z $SCENARIO ]; then
	export feature_list=test-scenarios/feature_list
	cat test-scenarios/*.test >$feature_list
else
	export feature_list=test-scenarios/$SCENARIO.test
fi

behave -v -f allure_behave.formatter:AllureFormatter -o "$REPORT_DIR" --no-capture --no-capture-stderr @$feature_list

if [ -z $SCENARIO ]; then
	rm -rvf $feature_list
fi
