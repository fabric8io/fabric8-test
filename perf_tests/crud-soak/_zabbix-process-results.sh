#!/bin/bash

# Needed ENV variables
#export SOAK_TIMESTAMP=`date +%s`
#PERFORMANCE_RESULTS=$WORKSPACE/devtools-performance-results
#ZABBIX_HOST_PREFIX="PerfHost"

CRUD_PHASE=$1
RTH=$PERFORMANCE_RESULTS/devtools-core-crud-$CRUD_PHASE-response-time-histogram.csv
AT=$PERFORMANCE_RESULTS/devtools-core-crud-$CRUD_PHASE-average-throughput.csv

zabbix_timestamp=`date +%s`

for i in `seq 10 50`;
do
	perc_k=`cut -d ';' -f $i $RTH | head -n 1`;
	[[ "x$perc_k" == "x" ]] && break;
	perc_v=`cut -d ';' -f $i $RTH | tail -n 1`;
	echo "$ZABBIX_HOST_PREFIX devtools.perf.core.$CRUD_PHASE.$perc_k $zabbix_timestamp $perc_v";
done

echo "$ZABBIX_HOST_PREFIX devtools.perf.core.$CRUD_PHASE.avg-throughput $zabbix_timestamp "`tail -n 1 $AT | cut -d ';' -f 3`;