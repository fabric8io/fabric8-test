#!/bin/bash
set -x
source _setenv.sh

INPUT="$JOB_BASE_NAME-$BUILD_NUMBER"
ENDPOINT=$1
METRIC_PREFIX=$2
if [ -z $ZABBIX_TIMESTAMP ]; then
  export ZABBIX_TIMESTAMP=`date +%s`;
fi

VALUES=(`cat $LOG_DIR/csv/$INPUT-report_requests.csv | grep -F "$ENDPOINT" | cut -d ',' -f 3-10 | tr ',' ' '`)
VAL_REQ=$((${VALUES[0]}+${VALUES[1]}))
VAL_PASS=${VALUES[0]}
VAL_FAIL=${VALUES[1]}
VAL_FAIL_RATE=`echo "100*$VAL_FAIL/$VAL_REQ" | bc -l`
VAL_MED=${VALUES[2]}
VAL_AVG=${VALUES[3]}
VAL_MIN=${VALUES[4]}
VAL_MAX=${VALUES[5]}

echo "$ZABBIX_HOST $METRIC_PREFIX-passed $ZABBIX_TIMESTAMP $VAL_PASS"
echo "$ZABBIX_HOST $METRIC_PREFIX-failed $ZABBIX_TIMESTAMP $VAL_FAIL"
echo "$ZABBIX_HOST $METRIC_PREFIX-fail_rate $ZABBIX_TIMESTAMP $VAL_FAIL_RATE"
echo "$ZABBIX_HOST $METRIC_PREFIX-rt_average $ZABBIX_TIMESTAMP $VAL_AVG"
echo "$ZABBIX_HOST $METRIC_PREFIX-rt_median $ZABBIX_TIMESTAMP $VAL_MED"
echo "$ZABBIX_HOST $METRIC_PREFIX-rt_min $ZABBIX_TIMESTAMP $VAL_MIN"
echo "$ZABBIX_HOST $METRIC_PREFIX-rt_max $ZABBIX_TIMESTAMP $VAL_MAX"

#DISTR=(`cat $INPUT-report_distribution.csv | sed -e 's/ /","/' | grep -F "$ENDPOINT" | tr ',' ' '`)
#echo "$ZABBIX_HOST $METRIC_PREFIX-rt_50 $ZABBIX_TIMESTAMP ${DISTR[4]}" # median
#echo "$ZABBIX_HOST $METRIC_PREFIX-rt_66 $ZABBIX_TIMESTAMP ${DISTR[5]}"
#echo "$ZABBIX_HOST $METRIC_PREFIX-rt_75 $ZABBIX_TIMESTAMP ${DISTR[6]}"
#echo "$ZABBIX_HOST $METRIC_PREFIX-rt_80 $ZABBIX_TIMESTAMP ${DISTR[7]}"
#echo "$ZABBIX_HOST $METRIC_PREFIX-rt_90 $ZABBIX_TIMESTAMP ${DISTR[8]}"
#echo "$ZABBIX_HOST $METRIC_PREFIX-rt_95 $ZABBIX_TIMESTAMP ${DISTR[9]}"
#echo "$ZABBIX_HOST $METRIC_PREFIX-rt_98 $ZABBIX_TIMESTAMP ${DISTR[10]}"
#echo "$ZABBIX_HOST $METRIC_PREFIX-rt_99 $ZABBIX_TIMESTAMP ${DISTR[11]}"
#echo "$ZABBIX_HOST $METRIC_PREFIX-rt_100 $ZABBIX_TIMESTAMP ${DISTR[12]}" # max

echo "$ZABBIX_HOST $METRIC_PREFIX-users $ZABBIX_TIMESTAMP $USERS"
if [ "$RUN_LOCALLY" != "true" ]; then
	echo "$ZABBIX_HOST $METRIC_PREFIX-slaves $ZABBIX_TIMESTAMP $SLAVES"
else
	echo "$ZABBIX_HOST $METRIC_PREFIX-slaves $ZABBIX_TIMESTAMP 0"
fi