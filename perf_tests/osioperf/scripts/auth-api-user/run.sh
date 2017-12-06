#!/bin/bash

source _setenv.sh

export COMMON="../_common"

echo " Wait for the server to become available"
./_wait-for-server.sh
if [ $? -gt 0 ]; then
	exit 1
fi

echo " Login users and get auth tokens"
LOGIN_USERS=$COMMON/loginusers

mvn -f $LOGIN_USERS/pom.xml clean compile
cat $USERS_PROPERTIES_FILE > $LOGIN_USERS/target/classes/users.properties
export TOKENS_FILE=`readlink -f /tmp/osioperftest.tokens`
mvn -f $LOGIN_USERS/pom.xml exec:java -Dauth.server.address=$SERVER_SCHEME://$SERVER_HOST -Dauth.server.port=$AUTH_PORT -Duser.tokens.file=$TOKENS_FILE
echo "#!/bin/bash
export USER_TOKENS=\"$(cat $TOKENS_FILE)\"
" > $ENV_FILE

echo " Prepare locustfile template"
./_prepare-locustfile.sh auth-api-user.py

echo " Shut Locust master down"
$COMMON/__stop-locust-master.sh

echo " Shut Locust slaves down"
SLAVES=10 $COMMON/__stop-locust-slaves.sh

echo " Start Locust master waiting for slaves"
$COMMON/__start-locust-master.sh

echo " Start all the Locust slaves"
$COMMON/__start-locust-slaves.sh

echo " Run test for $DURATION seconds"
sleep $DURATION

echo " Shut Locust master down"
$COMMON/__stop-locust-master.sh TERM

echo " Download locust reports from Locust master"
$COMMON/_gather-locust-reports.sh

echo " Extract CSV data from logs"
$COMMON/_locust-log-to-csv.sh 'GET auth-api-user ' $JOB_BASE_NAME-$BUILD_NUMBER-locust-master.log
$COMMON/_locust-log-to-csv.sh 'GET auth-api-user-github-token' $JOB_BASE_NAME-$BUILD_NUMBER-locust-master.log
$COMMON/_locust-log-to-csv.sh 'POST auth-api-token-refresh' $JOB_BASE_NAME-$BUILD_NUMBER-locust-master.log
$COMMON/_locust-log-to-csv.sh 'GET api-user-by-id' $JOB_BASE_NAME-$BUILD_NUMBER-locust-master.log
$COMMON/_locust-log-to-csv.sh 'GET api-user-by-name' $JOB_BASE_NAME-$BUILD_NUMBER-locust-master.log

echo " Generate charts from CSV"
export REPORT_CHART_WIDTH=1000
export REPORT_CHART_HEIGHT=600
for c in $(find *.csv | grep '\-POST_\+\|\-GET_\+'); do echo $c; $COMMON/_csv-response-time-to-png.sh $c; $COMMON/_csv-throughput-to-png.sh $c; $COMMON/_csv-failures-to-png.sh $c; done
for c in $(find *.csv | grep '_distribution.csv'); do echo $c; $COMMON/_csv-rt-histogram-to-png.sh $c; done

echo " Prepare results for Zabbix"
rm -rvf *-zabbix.log
./_zabbix-process-results.sh $JOB_BASE_NAME-$BUILD_NUMBER-report_requests.csv '"GET","auth-api-user"' "auth-api-user"
./_zabbix-process-results.sh $JOB_BASE_NAME-$BUILD_NUMBER-report_requests.csv '"GET","auth-api-user-github-token"' "auth-api-user-github-token"
./_zabbix-process-results.sh $JOB_BASE_NAME-$BUILD_NUMBER-report_requests.csv '"POST","auth-api-token-refresh"' "auth-api-token-refresh"
./_zabbix-process-results.sh $JOB_BASE_NAME-$BUILD_NUMBER-report_requests.csv '"GET","api-user-by-id"' "api-user-by-id"
./_zabbix-process-results.sh $JOB_BASE_NAME-$BUILD_NUMBER-report_requests.csv '"GET","api-user-by-name"' "api-user-by-name"

if [[ "$ZABBIX_REPORT_ENABLED" = "true" ]]; then
	echo "  Uploading report to zabbix...";
	zabbix_sender -vv -i $JOB_BASE_NAME-$BUILD_NUMBER-zabbix.log -T -z $ZABBIX_SERVER -p $ZABBIX_PORT;
fi

echo " Shut Locust slaves down"
$COMMON/__stop-locust-slaves.sh

echo " Check for errors in Locust master log"
if [[ "0" -ne `cat $JOB_BASE_NAME-$BUILD_NUMBER-locust-master.log | grep 'Error report' | wc -l` ]]; then echo '[:(] THERE WERE ERRORS OR FAILURES!!!'; else echo '[:)] NO ERRORS OR FAILURES DETECTED.'; fi
