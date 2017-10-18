#!/bin/bash

set -eu -o pipefail

declare -r SCRIPT_PATH=$(readlink -f "$0")
declare -r SCRIPT_DIR=$(cd $(dirname "$SCRIPT_PATH") && pwd)
source "$SCRIPT_DIR/common.inc.sh"


minishift_running() {
  local status=""
  status=$(minishift status)
  echo "$status" | grep -qE 'Minishift: .*Running'
}

validate_env() {
  local ret=0

  which minishift >/dev/null || { log.error "Could not find 'minishift' executable"; ret=1; }
  which oc >/dev/null || { log.error "Could not find 'oc' executable"; ret=1; }
  minishift_running || {
    log.error "minishift does not seem to be running"
    ret=1
  }
  return $ret
}


main() {

  validate_env || {
    log.info "Please fix the failures and re-run $0"
    exit 1
  }


  local default_test_conf_file="$SCRIPT_DIR/config/local_fabric8.conf.sh"

  # NOTE: setting and exporting TEST_CONFIG_FILE to prevent
  # local_run_EE_tests.sh from loading its default conf file
  export TEST_CONFIG_FILE="${TEST_CONFIG_FILE:-$default_test_conf_file}"

  log.info "Running the E2E tests locally against fabric8 on minishift"
  exec ./local_run_EE_tests.sh "$@"
}

main "$@"
