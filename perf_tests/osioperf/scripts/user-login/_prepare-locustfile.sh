#!/bin/bash

source _setenv.sh

LOCUST_FILE=${2:-osioperf.py}

echo "Creating locustfile template $LOCUST_FILE"
cp -rvf ${1:-user-login.py} $LOCUST_FILE

echo "Filtering $LOCUST_FILE"
sed -i -e "s,@@SERVER_SCHEME@@,$SERVER_SCHEME,g" $LOCUST_FILE;
sed -i -e "s,@@SERVER_HOST@@,$SERVER_HOST,g" $LOCUST_FILE;
sed -i -e "s,@@JOB_BASE_NAME@@,$JOB_BASE_NAME,g" $LOCUST_FILE;
sed -i -e "s,@@BUILD_NUMBER@@,$BUILD_NUMBER,g" $LOCUST_FILE;
sed -i -e "s,@@LAUNCHER_RUNTIME@@,$LAUNCHER_RUNTIME,g" $LOCUST_FILE;
sed -i -e "s,@@LAUNCHER_MISSION@@,$LAUNCHER_MISSION,g" $LOCUST_FILE;
sed -i -e "s,@@LAUNCHER_STRATEGY@@,$LAUNCHER_STRATEGY,g" $LOCUST_FILE;
sed -i -e "s,@@GH_USER@@,$GH_USER,g" $LOCUST_FILE;
sed -i -e "s,@@SPACE_PREFIX@@,$SPACE_PREFIX,g" $LOCUST_FILE;
sed -i -e "s,@@QUICKSTART_STARTED_TERMINAL@@,$QUICKSTART_STARTED_TERMINAL,g" $LOCUST_FILE;
