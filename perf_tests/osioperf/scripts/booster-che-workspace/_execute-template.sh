#!/bin/bash

source _setenv.sh

export COMMON="common.git"
git clone https://github.com/pmacik/openshiftio-performance-common $COMMON

echo " Wait for the server to become available"
./_wait-for-server.sh
if [ $? -gt 0 ]; then
	exit 1
fi

if [ "$RUN_LOCALLY" != "true" ]; then
	echo "#!/bin/bash
export USERS_PROPERTIES=\"0=0\"
" > $ENV_FILE-master;

	USER_COUNT=`cat $USERS_PROPERTIES_FILE | wc -l`
	i=1
	s=1
	rm -rf $USERS_PROPERTIES_FILE-slave-*;
	if [ $USER_COUNT -ge $SLAVES ]; then
		while [ $i -le $USER_COUNT ]; do
			sed "${i}q;d" $USERS_PROPERTIES_FILE >> $USERS_PROPERTIES_FILE-slave-$s;
			i=$((i+1));
			if [ $s -lt $SLAVES ]; then
				s=$((s+1));
			else
				s=1;
			fi;
		done;
	else
		while [ $s -le $SLAVES ]; do
			sed "${i}q;d" $USERS_PROPERTIES_FILE >> $USERS_PROPERTIES_FILE-slave-$s;
			s=$((s+1));
			if [ $i -lt $USER_COUNT ]; then
				i=$((i+1));
			else
				i=1;
			fi;
		done;
	fi
	for s in $(seq 1 $SLAVES); do
		echo "#!/bin/bash
export USERS_PROPERTIES=\"$(cat $USERS_PROPERTIES_FILE-slave-$s)\"
" > $ENV_FILE-slave-$s;
	done
else
	echo "#!/bin/bash
export USERS_PROPERTIES=\"`cat $USERS_PROPERTIES_FILE`\"
" > $ENV_FILE-master;
fi

echo " Prepare locustfile template"
./_prepare-locustfile.sh booster-che-workspace.py

if [ "$RUN_LOCALLY" != "true" ]; then
	echo " Shut Locust master down"
	$COMMON/__stop-locust-master.sh

	echo " Shut Locust slaves down"
	SLAVES=10 $COMMON/__stop-locust-slaves.sh

	echo " Start Locust master waiting for slaves"
	$COMMON/__start-locust-master.sh

	echo " Start all the Locust slaves"
	$COMMON/__start-locust-slaves.sh
else
	echo " Shut Locust master down"
	$COMMON/__stop-locust-master-standalone.sh
	echo " Run Locust locally"
	$COMMON/__start-locust-master-standalone.sh
fi
echo " Run test for $DURATION seconds"

sleep $DURATION
if [ "$RUN_LOCALLY" != "true" ]; then
	echo " Shut Locust master down"
	$COMMON/__stop-locust-master.sh TERM

	echo " Download locust reports from Locust master"
	$COMMON/_gather-locust-reports.sh
else
	$COMMON/__stop-locust-master-standalone.sh TERM
	./_clean-chromedriver.sh
fi

echo " Extract CSV data from logs"
@@GENERATE_LOCUST_LOG_TO_CSV@@

echo " Generate charts from CSV"
export REPORT_CHART_WIDTH=1000
export REPORT_CHART_HEIGHT=600
@@GENERATE_CSV_TO_PNG@@
function distribution_2_csv {
	HEAD=(`cat $1 | head -n 1 | sed -e 's,",,g' | sed -e 's, ,_,g' | sed -e 's,%,,g' | tr "," " "`)
	DATA=(`cat $1 | grep -F "$2" | sed -e 's,",,g' | sed -e 's, ,_,g' | tr "," " "`)
	NAME=`echo $1 | sed -e 's,-report_distribution,,g' | sed -e 's,\.csv,,g'`-`echo "$2" | sed -e 's,",,g' | sed -e 's, ,_,g;'`

	rm -rf $NAME-rt-histo.csv;
	for i in $(seq 2 $(( ${#HEAD[*]} - 1 )) ); do
		echo "${HEAD[$i]};${DATA[$i]}" >> $NAME-rt-histo.csv;
	done;
}
for c in $(find *.csv | grep '\-report_distribution.csv'); do
	@@GENERATE_DISTRIBUTION_2_CSV@@
done
for c in $(find *rt-histo.csv); do echo $c; $COMMON/_csv-rt-histogram-to-png.sh $c; done

echo " Prepare results for Zabbix"
rm -rvf *-zabbix.log
export ZABBIX_LOG=$JOB_BASE_NAME-$BUILD_NUMBER-zabbix.log
./_zabbix-process-results.sh $ZABBIX_LOG

if [[ "$ZABBIX_REPORT_ENABLED" = "true" ]]; then
	echo "  Uploading report to zabbix...";
	zabbix_sender -vv -i $ZABBIX_LOG -T -z $ZABBIX_SERVER -p $ZABBIX_PORT;
fi

RESULTS_FILE=$JOB_BASE_NAME-$BUILD_NUMBER-results.md
sed -e "s,@@JOB_BASE_NAME@@,$JOB_BASE_NAME,g" $JOB_BASE_NAME-$BUILD_NUMBER-results-template.md |
sed -e "s,@@BUILD_NUMBER@@,$BUILD_NUMBER,g" > $RESULTS_FILE

# Create HTML report
function filterZabbixValue {
   VALUE=`cat $1 | grep " $2" | head -n 1 | cut -d " " -f 4`
   sed -i -e "s,$3,$VALUE,g" $4
}

@@GENERATE_FILTER_ZABBIX_VALUE@@

REPORT_TIMESTAMP=`date '+%Y-%m-%d %H:%M:%S (%Z)'`
sed -i -e "s,@@TIMESTAMP@@,$REPORT_TIMESTAMP,g" $RESULTS_FILE

REPORT_FILE=$JOB_BASE_NAME-report.md
cat README.md $RESULTS_FILE > $REPORT_FILE
if [ -z "$GRIP_USER" ]; then
	grip --export $REPORT_FILE
else
	grip --user=$GRIP_USER --pass=$GRIP_PASS --export $REPORT_FILE
fi

if [ "$RUN_LOCALLY" != "true" ]; then
	echo " Shut Locust slaves down"
	$COMMON/__stop-locust-slaves.sh
fi

echo " Check for errors in Locust master log"
if [[ "0" -ne `cat $JOB_BASE_NAME-$BUILD_NUMBER-locust-master.log | grep 'Error report' | wc -l` ]]; then echo '[:(] THERE WERE ERRORS OR FAILURES!!!'; else echo '[:)] NO ERRORS OR FAILURES DETECTED.'; fi
