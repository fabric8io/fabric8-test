#!/bin/bash

##CONFIG=${1:-config}
##CONFIG_FILE="config/$CONFIG.sh"

function prepare_venv() {
	python3 -m venv venv && source venv/bin/activate && python3 "$(which pip3)" install -r requirements.txt
}

[ "$NOVENV" == "1" ] || prepare_venv || exit 1

##echo "Reading configuration from: $CONFIG_FILE"
##source "$CONFIG_FILE"

if [ -z "$SCENARIO" ]; then
	echo "Running all tests ..."
	export feature_list=test-scenarios/feature_list
	cat test-scenarios/*.test >$feature_list
else
	echo "Running test: $SCENARIO ..."
	export feature_list=test-scenarios/$SCENARIO.test
fi

PYTHONDONTWRITEBYTECODE=1 python3 "$(which behave)" -v -f allure_behave.formatter:AllureFormatter -o "$REPORT_DIR" --tags="osio.regular,${BEHAVE_DANGER_TAG:-~@osio.danger-zone}" --no-capture --no-capture-stderr @$feature_list

echo "All tests are done!"

if [ -z "$SCENARIO" ]; then
	rm -rvf "$feature_list"
fi
