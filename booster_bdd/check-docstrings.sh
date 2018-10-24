#!/usr/bin/env bash

export directories="../${PWD##*/}/features"

cd ../self_tests/ || exit
. check-python-docstyle.sh
