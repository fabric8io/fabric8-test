#!/bin/bash

# Should be provided by Jenkins.
#export WORKSPACE=`pwd`

# Should be provided by Jenkins.
#export JOB_BASE_NAME=planner-wit-benchmark

# Should be provided by Jenkins.
#export BUILD_NUMBER=0

export GOPATH=$WORKSPACE/go
export PATH="$PATH:$GOPATH/bin"

# 'true' if a report will be sent to a Zabbix instance.
#export ZABBIX_REPORT_ENABLED=false

# An address of Zabbix server.
#export ZABBIX_SERVER=zabbix.devshift.net

# A port of Zabbix server used by zabbix_sender utility.
#export ZABBIX_PORT=10051

# A hostname in Zabbix the report is for.
#export ZABBIX_HOST=osioperf-server-1
