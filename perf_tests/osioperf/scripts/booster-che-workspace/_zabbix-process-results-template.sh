#!/bin/bash

source _setenv.sh

export ZABBIX_LOG=$1
export ZABBIX_TIMESTAMP=`date +%s`

@@GENERATE_ZABBIX_PROCESS_LOAD@@