#!/bin/bash

source _setenv.sh

if [ ! -f "$1" ]; then
	echo "File '$1' not found! Skipping Zabbix reporting... !!!"
	exit 0
fi

INPUT=$1
ENDPOINT=${2-"GET","/api/user"}
METRIC_PREFIX=${3-auth-api-user}
TIMESTAMP=`date +%s`
ZABBIX_LOG_FILE=`echo $1 | sed -e 's,-report_requests\.csv,,g'`-zabbix.log

VALUES=(`cat $INPUT | grep -F "$ENDPOINT" | cut -d ',' -f 3-10 | tr ',' ' '`)
VAL_REQ=${VALUES[0]}
VAL_FAIL=${VALUES[1]}
VAL_FAIL_RATE=`echo "100*$VAL_FAIL/$VAL_REQ" | bc -l`
VAL_MED=${VALUES[2]}
VAL_AVG=${VALUES[3]}
VAL_MIN=${VALUES[4]}
VAL_MAX=${VALUES[5]}

echo "$ZABBIX_HOST $METRIC_PREFIX-failed $TIMESTAMP $VAL_FAIL" >> $ZABBIX_LOG_FILE
echo "$ZABBIX_HOST $METRIC_PREFIX-fail_rate $TIMESTAMP $VAL_FAIL_RATE" >> $ZABBIX_LOG_FILE
echo "$ZABBIX_HOST $METRIC_PREFIX-rt_average $TIMESTAMP $VAL_AVG" >> $ZABBIX_LOG_FILE
echo "$ZABBIX_HOST $METRIC_PREFIX-rt_median $TIMESTAMP $VAL_MED" >> $ZABBIX_LOG_FILE
echo "$ZABBIX_HOST $METRIC_PREFIX-rt_min $TIMESTAMP $VAL_MIN" >> $ZABBIX_LOG_FILE
echo "$ZABBIX_HOST $METRIC_PREFIX-rt_max $TIMESTAMP $VAL_MAX" >> $ZABBIX_LOG_FILE
echo "$ZABBIX_HOST $METRIC_PREFIX-users $TIMESTAMP $USERS" >> $ZABBIX_LOG_FILE
#echo "$ZABBIX_HOST $METRIC_PREFIX-users `echo "$TIMESTAMP - $DURATION" | bc -l` 0" >> $ZABBIX_LOG_FILE
echo "$ZABBIX_HOST $METRIC_PREFIX-slaves $TIMESTAMP $SLAVES" >> $ZABBIX_LOG_FILE
#echo "$ZABBIX_HOST $METRIC_PREFIX-slaves `echo "$TIMESTAMP - $DURATION" | bc -l` 0" >> $ZABBIX_LOG_FILE
