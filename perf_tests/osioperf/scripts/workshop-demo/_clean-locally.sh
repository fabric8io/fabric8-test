#!/bin/bash

source ./_setenv.sh

rm -vf *csv
rm -vf *log
rm -vf *png
rm -vf *report.md
rm -vf *results.md
rm -vf *html
rm -vf _zabbix-process-results.sh
rm -vf _execute.sh
rm -vf osioperf.py*
rm -vf $JOB_BASE_NAME-$BUILD_NUMBER-*
rm -rvf common.git