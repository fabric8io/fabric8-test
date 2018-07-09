#!/usr/bin/env bash

export directories="../${PWD##*/}/"

cd ../self_tests/ || exit
. check-PEP8-style.sh
