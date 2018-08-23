#!/bin/bash

CONFIG=${1:-config}
CONFIG_FILE="config/$CONFIG.sh"

function prepare_venv() {
	python3 -m venv venv && source venv/bin/activate && python3 "$(which pip3)" install -r requirements.txt
}

[ "$NOVENV" == "1" ] || prepare_venv || exit 1

echo "Reading configuration from: $CONFIG_FILE"
source "$CONFIG_FILE"

echo "SCENARIO=$SCENARIO"
echo "SERVER_ADDRESS=$SERVER_ADDRESS"
echo "FORGE_API=$FORGE_API"
echo "WIT_API=$WIT_API"
echo "AUTH_API=$AUTH_API"
echo "OSIO_USERNAME=$OSIO_USERNAME"
echo "OSIO_PASSWORD=$OSIO_PASSWORD"
echo "OSIO_DANGER_ZONE=$OSIO_DANGER_ZONE"
echo "PIPELINE=$PIPELINE"
echo "BOOSTER_MISSION=$BOOSTER_MISSION"
echo "BOOSTER_RUNTIME=$BOOSTER_RUNTIME"
echo "BLANK_BOOSTER=$BLANK_BOOSTER"
echo "GIT_REPO=$GIT_REPO"
echo "PROJECT_NAME=$PROJECT_NAME"
echo "AUTH_CLIENT_ID=$AUTH_CLIENT_ID"
echo "REPORT_DIR=$REPORT_DIR"
echo "UI_HEADLESS=$UI_HEADLESS"

echo "BEHAVE_DANGER_TAG=$BEHAVE_DANGER_TAG"
echo "OSO_USERNAME=$OSO_USERNAME"
echo "GITHUB_USERNAME=$GITHUB_USERNAME"

if [ -z "$SCENARIO" ]; then
	echo "Running all tests ..."
	export feature_list=test-scenarios/feature_list
	cat test-scenarios/*.test >$feature_list
else
	echo "Running test: $SCENARIO ..."
	export feature_list=test-scenarios/$SCENARIO.test
fi

#If you want the output in Allure format
CMD="PYTHONDONTWRITEBYTECODE=1 python3 \"$(which behave)\" -v -f allure_behave.formatter:AllureFormatter -o \"$REPORT_DIR\" --tags=\"@osio.regular,${BEHAVE_DANGER_TAG:-~@osio.danger-zone}\" --no-capture --no-capture-stderr @$feature_list"

#If you want the output in default format
#CMD="PYTHONDONTWRITEBYTECODE=1 python3 \"$(which behave)\" -v --tags=\"@osio.regular,${BEHAVE_DANGER_TAG:-~@osio.danger-zone}\" --no-capture --no-capture-stderr @$feature_list"

bash -v -c "$CMD"

echo "All tests are done!"

if [ -z "$SCENARIO" ]; then
	rm -rvf "$feature_list"
fi
