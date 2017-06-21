#set -x

## Needed ENV Variables
#export WORKSPACE=$PWD
#export ITERATIONS=100000
#export THREADS=30
#export USERS=300
#export SERVER_HOST=core-api-route-dsaas-e2e-testing.b6ff.rh-idev.openshiftapps.com
#export SERVER_PORT=80
#export PERFREPO_ENABLED=false
#export ZABBIX_REPORT_ENABLED=false
#export ZABBIX_HOST_PREFIX="PerfHost"

## Actuall test

export PERFCAKE_VERSION=7.5
export PERFCAKE_HOME=$WORKSPACE/perfcake-$PERFCAKE_VERSION

if [[ "x$CYCLE" != "x" ]];
then
   export PERFORMANCE_RESULTS=$WORKSPACE/devtools-performance-results/$CYCLE;
else
   export PERFORMANCE_RESULTS=$WORKSPACE/devtools-performance-results;
fi

# Prepare clean environment
rm -rf $PERFORMANCE_RESULTS
mkdir -p $PERFORMANCE_RESULTS

export TOKEN_LIST=$PERFORMANCE_RESULTS/token.keys
export WORK_ITEM_IDS=$PERFORMANCE_RESULTS/workitem-id.list
export SOAK_SUMMARY=$PERFORMANCE_RESULTS/soak-summary.log
export ZABBIX_REPORT=$PERFORMANCE_RESULTS/zabbix-report.txt

# Get Perfcake, and our preconfigured Perfcake test config file
if [[ "x$CYCLE" < "x1" ]];
#if false;
then
   #rm -rf PerfCake.git
   #git clone -b v7.5 https://github.com/PerfCake/PerfCake PerfCake.git;
   #echo "Building PerfCake..."
   #mvn -f PerfCake.git/pom.xml clean install assembly:single -DskipTests 2>&1 > $PERFORMANCE_RESULTS/perfcake-build-maven.log
   wget -O perfcake-$PERFCAKE_VERSION-bin.zip https://www.perfcake.org/download/perfcake-$PERFCAKE_VERSION-bin.zip

   #rm -rf Plugins.git
   #git clone https://github.com/PerfCake/Plugins Plugins.git;
   #echo "Building PerfRepo Destination plugin..."
   #mvn -f Plugins.git/perfrepo-destination/pom.xml clean install -DskipTests 2>&1 > $PERFORMANCE_RESULTS/perfrepo-destination-build-maven.log
   #echo "Building HttpClientSender plugin..."
   #mvn -f Plugins.git/httpclient-sender/pom.xml clean install -DskipTests 2>&1 > $PERFORMANCE_RESULTS/httpclient-sender-build-maven.log
   wget -O httpclient-sender-$PERFCAKE_VERSION.zip https://github.com/PerfCake/Plugins/releases/download/v$PERFCAKE_VERSION/httpclient-sender-$PERFCAKE_VERSION.zip
   unzip -qo httpclient-sender-$PERFCAKE_VERSION.zip
   wget -O perfrepo-destination-$PERFCAKE_VERSION.zip https://github.com/PerfCake/Plugins/releases/download/v$PERFCAKE_VERSION/perfrepo-destination-$PERFCAKE_VERSION.zip
   unzip -qo perfrepo-destination-$PERFCAKE_VERSION.zip
   echo "Building PostgreSQL monitor plugin..."
   mvn -f postgresql-monitor-reporter/pom.xml clean package -DskipTests 2>&1 > $PERFORMANCE_RESULTS/postgresql-monitor-reporter-build-maven.log
fi

rm -rf $PERFCAKE_HOME;
#unzip -qo PerfCake.git/perfcake/target/perfcake-$PERFCAKE_VERSION-bin.zip;
unzip -qo perfcake-$PERFCAKE_VERSION-bin.zip;
#cp -rf Plugins.git/perfrepo-destination/target/perfrepo-*.jar $PERFCAKE_HOME/lib/plugins/;
#cp -rf Plugins.git/perfrepo-destination/target/lib/*.jar $PERFCAKE_HOME/lib/plugins/;
#cp -rf Plugins.git/httpclient-sender/target/httpclient-*.jar $PERFCAKE_HOME/lib/plugins/;
#cp -rf Plugins.git/httpclient-sender/target/lib/*.jar $PERFCAKE_HOME/lib/plugins/;
cp -rf postgresql-monitor-reporter/target/postgresql-monitor-reporter-*.jar $PERFCAKE_HOME/lib/plugins/;
cp -rf postgresql-monitor-reporter/target/lib/*.jar $PERFCAKE_HOME/lib/plugins/;
cp -rf perfrepo-destination/*.jar $PERFCAKE_HOME/lib/plugins/;
cp -rf httpclient-sender/*.jar $PERFCAKE_HOME/lib/plugins/;
cp perfcake/scenarios/devtools-core-crud-create.xml $PERFCAKE_HOME/resources/scenarios/;
cp perfcake/scenarios/devtools-core-crud-read.xml $PERFCAKE_HOME/resources/scenarios/;
cp perfcake/scenarios/devtools-core-crud-update.xml $PERFCAKE_HOME/resources/scenarios/;
cp perfcake/scenarios/devtools-core-crud-delete.xml $PERFCAKE_HOME/resources/scenarios/;

# Verify the Core version
if [[ "x$CORE_SERVER_COMMIT" != "x" ]];
then
	echo "Verifying the Core server version..."
	current_server_status=`curl --silent http://$SERVER_HOST:$SERVER_PORT/api/status | grep commit | sed -e 's,":",=,g' | sed -e 's,[{"}],,g' | sed -e 's,\,,;,g'`
	echo $current_server_status
	current_server_commit=`echo $current_server_status | sed -e 's,.*commit=\([^;]*\);.*,\1,g'`
	echo "The Core version is $current_server_commit"
	if [[ $CORE_SERVER_COMMIT != $current_server_commit ]];
	then
		echo "ERROR: THE CORE VERSION ($current_server_commit) HAS CHANGED FROM EXPECTED ($CORE_SERVER_COMMIT).";
		exit 1;
	fi;
fi

# Generate auth token to create test users
curl --silent -X GET -H "Accept: application/json" http://$SERVER_HOST:$SERVER_PORT/api/login/generate > /dev/null

echo "Retrieving user ID..."
export CORE_USER_ID=`curl --silent -X GET -H "Accept: application/json" "http://$SERVER_HOST:$SERVER_PORT/api/search/users?q=testuser" | sed -e 's,.*"id":"\([^"]*\)".*,\1,g'`
if [[ "$CORE_USER_ID" =~ [0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12} ]];
then
	echo "User ID is: $CORE_USER_ID";
else
	echo "Unable to get user ID: $CORE_USER_ID";
	exit 1;
fi
create_space_json="{
  \"data\": {
    \"attributes\": {
      \"description\": \"This is the devtools-performance collaboration space\",
      \"name\": \"devtools-performance-"`date +%s`"\"
    },
    \"relationships\": {
      \"collaborators\": {
        \"data\": {
          \"id\": \"$CORE_USER_ID\",
          \"type\": \"identities\"
        }
      },
      \"owned-by\": {
        \"data\": {
          \"id\": \"$CORE_USER_ID\",
          \"type\": \"identities\"
        }
      }
    },
    \"type\": \"spaces\"
  }
}"

auth_resp=$(curl --silent -X GET --header 'Accept: application/json' 'http://'$SERVER_HOST':'$SERVER_PORT'/api/login/generate')
token=$(echo $auth_resp | cut -d ":" -f 3 | sed -e 's/","expires_in//g' | sed -e 's/"//g');
space_resp=`curl --silent -X POST -H "Content-Type: application/json" -H "Accept: application/json" -H "Authorization: Bearer $token" http://$SERVER_HOST:$SERVER_PORT/api/spaces -d "$create_space_json"`
export WORK_ITEMS_SPACE=`echo $space_resp | grep self | sed -e 's,.*"self":"[^"]*/api/spaces/\([^"]*\)".*,\1,g'`
if [[ "$WORK_ITEMS_SPACE" =~ [0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12} ]];
then
	echo "Workitem space ID is: $WORK_ITEMS_SPACE";
else
	echo "Unable to get workitem space ID: $WORK_ITEMS_SPACE";
	exit 1;
fi
export WORK_ITEMS_BASE_URI="api/spaces/$WORK_ITEMS_SPACE/workitems"
export WORK_ITEMS_URI="http://$SERVER_HOST:$SERVER_PORT/$WORK_ITEMS_BASE_URI"

if [[ "x$CYCLE" != "x" ]];
then
   echo "==========================================" >> $SOAK_SUMMARY;
   echo "Cycle # $CYCLE:" >> $SOAK_SUMMARY;
fi
echo "Running $ITERATIONS iterations with $THREADS threads" >> $SOAK_SUMMARY

chmod +x ./_generate-auth-tokens.sh
chmod +x ./_get-workitem-count.sh

echo "$ZABBIX_HOST_PREFIX devtools.perf.core.commit $SOAK_TIMESTAMP $CORE_SERVER_COMMIT" >> $ZABBIX_REPORT

# Get a baseline of workitems in DB
echo "BEFORE:" >> $SOAK_SUMMARY
./_get-workitem-count.sh 2>>$SOAK_SUMMARY >> $SOAK_SUMMARY

export PERFREPO_TAGS="threads=$THREADS;iterations=$ITERATIONS;users=$USERS;jenkins=$BUILD_TAG"
if [[ "x$ADDITIONAL_PERFREPO_TAGS" != "x" ]];
then
   export PERFREPO_TAGS="$PERFREPO_TAGS;$ADDITIONAL_PERFREPO_TAGS";
fi
export REPORT_PERIOD=`expr $ITERATIONS / 100`
export PERFCAKE_PROPS="-Dthread.count=$THREADS \
-Diteration.count=$ITERATIONS \
-Duser.id=$CORE_USER_ID \
-Dworkitems.space.id=$WORK_ITEMS_SPACE \
-Dworkitemid.list=file:$WORK_ITEM_IDS \
-Dauth.token.list=file:$TOKEN_LIST \
-Dserver.host=$SERVER_HOST \
-Dserver.port=$SERVER_PORT \
-Dperfrepo.tags=$PERFREPO_TAGS \
-Dperfrepo.enabled=$PERFREPO_ENABLED \
-Dreport.period=$REPORT_PERIOD \
-Dperfcake.fail.fast=true \
-Dhttp.maxConnections=$THREADS \
-Ddb.host=$DB_HOST \
-Ddb.port=$DB_PORT \
-Ddb.user=$DB_USER \
-Ddb.password=$DB_PASSWORD \
-Ddb.name=$DB_NAME"

# (C)RUD
# Parse/extract the token for the test
bash -c ./_generate-auth-tokens.sh
# Execute PerfCake
$PERFCAKE_HOME/bin/perfcake.sh -s devtools-core-crud-create $PERFCAKE_PROPS
echo "PerfCake Exited with code $?"
cat $PERFCAKE_HOME/perfcake-validation.log | grep Response | sed -e 's,.*/'$WORK_ITEMS_BASE_URI'/\([^"/]*\)/.*".*,\1,g' | grep -v 'null' > $WORK_ITEM_IDS
#cat $PERFCAKE_HOME/devtools-core-crud-create-average-throughput.csv
mv -vf $PERFCAKE_HOME/devtools-core-crud-create-*.csv $PERFORMANCE_RESULTS
./_zabbix-process-results.sh create >> $ZABBIX_REPORT
mv $PERFCAKE_HOME/perfcake-validation.log $PERFORMANCE_RESULTS/perfcake-validation-create.log
#rm -vf $PERFCAKE_HOME/perfcake-validation.log
mv $PERFCAKE_HOME/perfcake.log $PERFORMANCE_RESULTS/perfcake-create.log

echo "After CREATE:" >> $SOAK_SUMMARY
wi_count_msg=`./_get-workitem-count.sh 2>&1`
echo $wi_count_msg >> $SOAK_SUMMARY
echo "$ZABBIX_HOST_PREFIX devtools.perf.core.create.count "`date +%s`" "`echo $wi_count_msg | sed -e 's,.*:\(.*\),\1,g'` >> $ZABBIX_REPORT

# C(R)UD
# Parse/extract the token for the test
#bash -c ./_generate-auth-tokens.sh
# Execute PerfCake
$PERFCAKE_HOME/bin/perfcake.sh -s devtools-core-crud-read $PERFCAKE_PROPS
echo "PerfCake Exited with code $?"
#cat $PERFCAKE_HOME/devtools-core-crud-read-average-throughput.csv
mv -vf $PERFCAKE_HOME/devtools-core-crud-read-*.csv $PERFORMANCE_RESULTS
./_zabbix-process-results.sh read >> $ZABBIX_REPORT
#mv $PERFCAKE_HOME/perfcake-validation.log $PERFORMANCE_RESULTS/perfcake-validation-read.log
rm -vf $PERFCAKE_HOME/perfcake-validation.log
mv $PERFCAKE_HOME/perfcake.log $PERFORMANCE_RESULTS/perfcake-read.log

echo "After READ:" >> $SOAK_SUMMARY
#./_get-workitem-count.sh 2>>$SOAK_SUMMARY >> $SOAK_SUMMARY
wi_count_msg=`./_get-workitem-count.sh 2>&1`
echo $wi_count_msg >> $SOAK_SUMMARY
echo "$ZABBIX_HOST_PREFIX devtools.perf.core.read.count "`date +%s`" "`echo $wi_count_msg | sed -e 's,.*:\(.*\),\1,g'` >> $ZABBIX_REPORT

# CR(U)D
# Parse/extract the token for the test
#bash -c ./_generate-auth-tokens.sh
## Execute PerfCake
$PERFCAKE_HOME/bin/perfcake.sh -s devtools-core-crud-update $PERFCAKE_PROPS
echo "PerfCake Exited with code $?"
#cat $PERFCAKE_HOME/devtools-core-crud-update-average-throughput.csv
mv -vf $PERFCAKE_HOME/devtools-core-crud-update-*.csv $PERFORMANCE_RESULTS
./_zabbix-process-results.sh update >> $ZABBIX_REPORT
#mv $PERFCAKE_HOME/perfcake-validation.log $PERFORMANCE_RESULTS/perfcake-validation-update.log
rm -vf $PERFCAKE_HOME/perfcake-validation.log
mv $PERFCAKE_HOME/perfcake.log $PERFORMANCE_RESULTS/perfcake-update.log

echo "After UPDATE:" >> $SOAK_SUMMARY
#./_get-workitem-count.sh 2>>$SOAK_SUMMARY >> $SOAK_SUMMARY
wi_count_msg=`./_get-workitem-count.sh 2>&1`
echo $wi_count_msg >> $SOAK_SUMMARY
echo "$ZABBIX_HOST_PREFIX devtools.perf.core.update.count "`date +%s`" "`echo $wi_count_msg | sed -e 's,.*:\(.*\),\1,g'` >> $ZABBIX_REPORT

# CRU(D)
# Parse/extract the token for the test
#bash -c ./_generate-auth-tokens.sh
# Execute PerfCake
$PERFCAKE_HOME/bin/perfcake.sh -s devtools-core-crud-delete $PERFCAKE_PROPS
echo "PerfCake Exited with code $?"
#cat $PERFCAKE_HOME/devtools-core-crud-delete-average-throughput.csv
mv -vf $PERFCAKE_HOME/devtools-core-crud-delete*.csv $PERFORMANCE_RESULTS
./_zabbix-process-results.sh delete >> $ZABBIX_REPORT
#mv $PERFCAKE_HOME/perfcake-validation.log $PERFORMANCE_RESULTS/perfcake-validation-delete.log
rm -vf $PERFCAKE_HOME/perfcake-validation.log
mv $PERFCAKE_HOME/perfcake.log $PERFORMANCE_RESULTS/perfcake-delete.log

echo "After DELETE (disabled):" >> $SOAK_SUMMARY
#./_get-workitem-count.sh 2>>$SOAK_SUMMARY >> $SOAK_SUMMARY
wi_count_msg=`./_get-workitem-count.sh 2>&1`
echo $wi_count_msg >> $SOAK_SUMMARY
echo "$ZABBIX_HOST_PREFIX devtools.perf.core.delete.count "`date +%s`" "`echo $wi_count_msg | sed -e 's,.*:\(.*\),\1,g'` >> $ZABBIX_REPORT

# Delete space
auth_resp=`curl --silent -X GET --header 'Accept: application/json' 'http://'$SERVER_HOST':'$SERVER_PORT'/api/login/generate'`
token=`echo $auth_resp | cut -d ":" -f 3 | sed -e 's/","expires_in//g' | sed -e 's/"//g'`

curl -X DELETE -H "Authorization: Bearer $token" http://$SERVER_HOST:$SERVER_PORT/api/spaces/$WORK_ITEMS_SPACE

echo "Soak test summary:"
cat $SOAK_SUMMARY
echo "Zabbix report"
cat $ZABBIX_REPORT

if [[ "$ZABBIX_REPORT_ENABLED" -eq "true" ]];
then
	echo "Uploading report to zabbix...";
	zabbix_sender -i $ZABBIX_REPORT -T -z zabbix.devshift.net -p 10051;
fi

# Copy the PerfCake results to the jenkins' workspace to be able to archive
cp -rvf $PERFCAKE_HOME/perfcake-chart $PERFORMANCE_RESULTS
