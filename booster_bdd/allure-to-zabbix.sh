#!/bin/bash

#REPORT_DIR=target
#ZABBIX_HOST=qa_openshift.io
#ZABBIX_METRIC_PREFIX="booster-bdd.$SCENARIO"

ZABBIX_TIMESTAMP="${ZABBIX_TIMESTAMP:-$(date +%s)}"

ALLURE_REPORT="${1:-$REPORT_DIR/allure-report}"
if [ -d "$ALLURE_REPORT" ]; then
    DATA_DIR="$ALLURE_REPORT/data"

    NAME=($(jq '.["children"][] | .name' $DATA_DIR/suites.json | tr -d '"' | sed -e 's,[ \\],_,g' | sed -e "s,['],-,g"))
    STATUS=($(jq '.["children"][] | .status' $DATA_DIR/suites.json | tr -d '"'))
    DURATION=($(jq '.["children"][] | .time.duration' $DATA_DIR/suites.json | tr -d '"'))

    N=$(expr ${#NAME[@]} - 1)

    for i in $(seq 0 $N); do
        SUITE_STATUS=-1 # assume failed, unless...
        if [ "${STATUS[$i]}" == "passed" ]; then
            SUITE_STATUS=1
        elif [ "${STATUS[$i]}" == "skipped" ]; then
            SUITE_STATUS=0
        fi
        echo "$ZABBIX_HOST $ZABBIX_METRIC_PREFIX.${NAME[$i]}.status $ZABBIX_TIMESTAMP $SUITE_STATUS"
        echo "$ZABBIX_HOST $ZABBIX_METRIC_PREFIX.${NAME[$i]}.duration $ZABBIX_TIMESTAMP ${DURATION[$i]}"
    done
fi
