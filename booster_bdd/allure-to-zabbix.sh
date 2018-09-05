#!/bin/bash

#REPORT_DIR=target
#ZABBIX_HOST=qa_openshift.io
#ZABBIX_METRIC_PREFIX="booster-bdd.$SCENARIO"

ZABBIX_TIMESTAMP="${ZABBIX_TIMESTAMP:-$(date +%s)}"

ALLURE_REPORT="${1:-$REPORT_DIR/allure-report}"
if [ -d "$ALLURE_REPORT" ]; then
    DATA_DIR="$ALLURE_REPORT/data/test-cases"

    for tc in $(find $DATA_DIR -name '*.json'); do
        ZABBIX_METRIC=$(jq '.labels[] | select(.name == "tag") | select(.value | contains ("osio.zabbix-metric")) | .value' $tc | tr -d '"')
        ZABBIX_METRIC=${ZABBIX_METRIC#$"osio.zabbix-metric."}
        SCENARIO_STATUS=$(jq '.status' $tc | tr -d '"')
        DURATION=$(jq '.time.duration' $tc | tr -d '"')
        STATUS=-1 # assume failed, unless...
        if [ "$SCENARIO_STATUS" == "passed" ]; then
            STATUS=1
        elif [ "$SCENARIO_STATUS" == "skipped" ]; then
            STATUS=0
        fi
        echo "$ZABBIX_HOST $ZABBIX_METRIC_PREFIX.$ZABBIX_METRIC.status $ZABBIX_TIMESTAMP $STATUS"
        echo "$ZABBIX_HOST $ZABBIX_METRIC_PREFIX.$ZABBIX_METRIC.duration $ZABBIX_TIMESTAMP $DURATION"
    done
fi
