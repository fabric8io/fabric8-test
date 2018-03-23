#!/bin/bash

# Should be provided by Jenkins.
#export JOB_BASE_NAME=osio-jenkins-pods-check

# Should be provided by Jenkins.
#export BUILD_NUMBER=0

# Openshift Online address.
#export OSO_ADDRESS=https://api.starter-us-east-2a.openshift.com

# A name of the property file with username=password list of users to be logged in
#export USERS_PROPERTIES_FILE=users.properties

# A space separated list of expected jenkins pod names
#export EXPECTED_PODS="devtools-automated-tests-osiotest1-jenkins devtools-automated-tests-osiotest2-jenkins devtools-automated-tests-osiotest3-jenkins devtools-automated-tests-osiotest4-jenkins devtools-automated-tests-osiotest5-jenkins devtools-automated-tests-osiotest6-jenkins devtools-automated-tests-osiotest7-jenkins devtools-automated-tests-osiotest8-jenkins devtools-automated-tests-osiotest9-jenkins devtools-automated-tests-osiotest10-jenkins"

# A file where USERS_PROPERTIES environmental variable is supposed to be set.
# This file is copied to locust master/slaves to be sources by BASH before executing the locust itself.
# So the locust process get's passed the USERS_PROPERTIES variable.
#export ENV_FILE=/tmp/osioperftest.users.env

# 'true' if a report will be sent to a Zabbix instance
#export ZABBIX_REPORT_ENABLED=false

# An address of Zabbix server
#export ZABBIX_SERVER=zabbix.devshift.net

# A port of Zabbix server used by zabbix_sender utility
#export ZABBIX_PORT=10051

# A hostname in Zabbix the report is for
#export ZABBIX_HOST=qa_jenkins.openshift.io
