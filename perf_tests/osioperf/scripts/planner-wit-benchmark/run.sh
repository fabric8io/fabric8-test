#!/bin/bash

source _setenv.sh

echo " Clean Docker environment"
./_clean-docker.sh

echo " Prepare environment"
./_prepare.sh

echo " Build WIT server"
./_build.sh

echo " Run tests"
./_test.sh

echo " Prepare Zabbix report"
export ZABBIX_LOG=$WORKSPACE/$JOB_BASE_NAME-$BUILD_NUMBER-zabbix.log
./_zabbix.sh $WORKSPACE/$JOB_BASE_NAME-$BUILD_NUMBER-results.csv $ZABBIX_LOG

if [[ "$ZABBIX_REPORT_ENABLED" = "true" ]]; then
	echo "  Uploading report to zabbix...";
	zabbix_sender -vv -i $ZABBIX_LOG -T -z $ZABBIX_SERVER -p $ZABBIX_PORT;
fi

