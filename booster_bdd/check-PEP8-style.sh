#!/usr/bin/env bash

export directories="../${PWD##*/}/features"

cd ../self_tests/ || exit
. check-PEP8-style.sh
