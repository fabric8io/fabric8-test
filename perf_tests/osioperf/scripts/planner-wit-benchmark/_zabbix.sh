#!/bin/bash

source _setenv.sh

IN=${1-$WORKSPACE/$JOB_BASE_NAME-$BUILD_NUMBER-results.csv}
ZABBIX_LOG=${2:-$WORKSPACE/$JOB_BASE_NAME-$BUILD_NUMBER-zabbix.log}

TIMESTAMP=`date +%s`

for i in `cat $IN`; do
	RECORD=(`echo $i | tr ";" " ";`)
	PREFIX="$ZABBIX_HOST Benchmark."`echo -n ${RECORD[0]} | sed -e 's,/,.,g' | sed -e 's,Benchmark,,g'`
	echo "$PREFIX.Iterations $TIMESTAMP ${RECORD[1]}" >> $ZABBIX_LOG
	echo "$PREFIX.Time $TIMESTAMP ${RECORD[2]}" >> $ZABBIX_LOG
	echo "$PREFIX.Bytes $TIMESTAMP ${RECORD[4]}" >> $ZABBIX_LOG
	echo "$PREFIX.Allocations $TIMESTAMP ${RECORD[6]}" >> $ZABBIX_LOG
done
