#!/bin/bash

source ./_setenv.sh

rm -vf *log
rm -vf *png
rm -vf osioperf.py*
rm -vf $JOB_BASE_NAME-$BUILD_NUMBER-*
rm -rvf common.git
