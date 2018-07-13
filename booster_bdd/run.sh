#!/bin/bash
CONFIG=${1:-config}
CONFIG_FILE="config/$CONFIG.sh"

echo "Reading configuration from: $CONFIG_FILE"
source "$CONFIG_FILE"

if [ -z $SCENARIO ]; then
	echo "Running all tests ..."
	export feature_list=test-scenarios/feature_list
	cat test-scenarios/*.test >$feature_list
else
	echo "Runnint test: $SCENARIO ..."
	export feature_list=test-scenarios/$SCENARIO.test
fi

behave -v -f allure_behave.formatter:AllureFormatter -o "$REPORT_DIR" --no-capture --no-capture-stderr @$feature_list

echo "All tests are done!"

if [ -z $SCENARIO ]; then
	rm -rvf $feature_list
fi
