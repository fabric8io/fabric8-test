#!/bin/bash

yum install -y epel-release
yum install jq

yes | ./local_clean_test_repos.sh