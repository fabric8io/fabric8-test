#!/bin/bash

#stop on error
set -e

yum install -y epel-release
yum install -y jq

# Export needed vars
set +x
for var in GITHUB_TOKEN; do
  export "$(grep ${var} ../jenkins-env | xargs)"
done

if [ -z "$GITHUB_TOKEN" ]; then
  echo "required variable GITHUB_TOKEN is not defined"
  exit 1
fi
set -x

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd)"

yes | $DIR/local_clean_test_repos.sh
