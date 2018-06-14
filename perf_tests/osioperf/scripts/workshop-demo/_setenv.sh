#!/bin/bash

# 'true" if locust test is to be run locally (i.e. no master, no slaves, no remote execution).
export RUN_LOCALLY=${RUN_LOCALLY:-true}

# Should be provided by Jenkins.
export JOB_BASE_NAME=${JOB_BASE_NAME:-workshop-demo}

# Should be provided by Jenkins.
export BUILD_NUMBER=${BUILD_NUMBER:-0}

# A name of the directory where logs and reports are placed during the test execution
export LOG_DIR=${LOG_DIR:-$JOB_BASE_NAME-$BUILD_NUMBER-logs}

# Auth server HTTP scheme http/https
export SERVER_SCHEME=${SERVER_SCHEME:-https}

# Auth server machine address.
export SERVER_HOST=${SERVER_HOST:-openshift.io}

# Locust SSH user. (Only for RUN_LOCALLY != true)
export SSH_USER=${SSH_USER:-jenkins}

# Locust node workdir. (Only for RUN_LOCALLY != true)
export SSH_WORKDIR=${SSH_WORKDIR:-/var/lib/jenkins/osioperf}

# Locust MASTER node. (Only for RUN_LOCALLY != true)
export MASTER_HOST=${MASTER_HOST:-osioperf-master2}

# A number of Locust slaves to use. (Only for RUN_LOCALLY != true)
export SLAVES=${SLAVES:-1}

# A prefix for a Locust slave node address. (Only for RUN_LOCALLY != true)
export SLAVE_PREFIX=${SLAVE_PREFIX:-osioperf-slave}

# A number of users to spawn.
export USERS=${USERS:-1}

# A hatch rate (number of users to spawn per second).
export USER_HATCH_RATE=${USER_HATCH_RATE:-1}

# A name of the property file with username=password list of users to be logged in
export USERS_PROPERTIES_FILE=${USERS_PROPERTIES_FILE:-users.properties}

# 'true' if a report will be sent to a Zabbix instance
export ZABBIX_REPORT_ENABLED=${ZABBIX_REPORT_ENABLED:-false}

# An address of Zabbix server
export ZABBIX_SERVER=${ZABBIX_SERVER:-zabbix.devshift.net}

# A port of Zabbix server used by zabbix_sender utility
export ZABBIX_PORT=${ZABBIX_PORT:-10051}

# A hostname in Zabbix the report is for
export ZABBIX_HOST=${ZABBIX_HOST:-qa_openshift.io}

# A number of seconds for how long the test should run
export DURATION=${DURATION:-3600}

export LAUNCHER_MISSION=${LAUNCHER_MISSION:-"REST API Level 0"}
export LAUNCHER_RUNTIME=${LAUNCHER_RUNTIME:-"Eclipse Vert.x"}
export LAUNCHER_STRATEGY=${LAUNCHER_STRATEGY:-"Rollout to Run"}
export QUICKSTART_STARTED_TERMINAL=${QUICKSTART_STARTED_TERMINAL:-"Succeeded in deploying verticle"}

# GitHub user name
export GH_USER=${GH_USER:-osioperftest}

# GitHub token for removing repos after test is done
export GH_TOKEN=${GH_TOKEN:-}

export SPACE_PREFIX=${SPACE_PREFIX:-"wd"}

export REPORT_CHART_WIDTH=1000
export REPORT_CHART_HEIGHT=600

export README_FILE=README.md

export METRIC_META_FILE=_metrics.meta