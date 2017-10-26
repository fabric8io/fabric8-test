#!/bin/bash

set -eu -o pipefail

declare -r SCRIPT_PATH=$(readlink -f "$0")
declare -r SCRIPT_DIR=$(cd $(dirname "$SCRIPT_PATH") && pwd)

source "$SCRIPT_DIR/common.inc.sh"


validate_config() {
  local ret=0
  validate_test_config OSIO_URL "$OSIO_URL" || ret=1
  validate_test_config OSIO_USERNAME "$OSIO_USERNAME" || ret=1
  validate_test_config OSIO_PASSWORD "$OSIO_PASSWORD" || ret=1
  validate_test_config OSIO_REFRESH_TOKEN "$OSIO_REFRESH_TOKEN" ||  ret=1

  validate_test_config OSO_TOKEN "$OSO_TOKEN" || ret=1
  validate_test_config OSO_USERNAME "$OSO_USERNAME" || ret=1

  validate_test_config GITHUB_USERNAME "$GITHUB_USERNAME" ||  ret=1

  validate_test_config PROTRACTOR_CONFIG_JS "$PROTRACTOR_CONFIG_JS" || ret=1

  validate_test_config TEST_SUITE "$TEST_SUITE" || ret=1
  validate_test_config TEST_PLATFORM "$TEST_PLATFORM" || ret=1
  validate_test_config TEST_QUICKSTART "$TEST_QUICKSTART" || ret=1
  return $ret
}

show_logs() {
  # cat log file to stdout

  local log_file="$1"; shift

  echo
  echo "------------------------------------------"
  echo "Log file:"
  cat "$log_file"
  echo "------------------------------------------"
  echo
}


main() {
  script.show_callstack_on_bad_exit

  local default_test_conf_file="$SCRIPT_DIR/config/local_osio.conf.sh"
  local conf_file="${TEST_CONFIG_FILE:-$default_test_conf_file}"

  log.info "Loading test config file: $conf_file"
  source "$conf_file"

  validate_config || {
    log.info "Please set test configs and re-run $0"
    exit 1
  }

  local log_file="${SCRIPT_DIR}/functional_tests.log"

  # NOTE: DO NOT start and kill webdriver if it is already running
  webdriver_running || {
    start_webdriver "$log_file"
    wait_for_webdriver
  }

  # Finally run protractor
  log.info Running protractor test suite "$PROTRACTOR_CONFIG_JS" \
    with OpenShift username $OSO_USERNAME and \
    GitHub username $GITHUB_USERNAME  \
    on server $OSIO_URL  ...

  # NOTE: npm has difficulty escaping the strings that contain '`'
  # hence using npm bin hack
  "$(npm bin)/protractor" "$PROTRACTOR_CONFIG_JS" \
    --suite "$TEST_SUITE" \
    --params.login.user="$OSIO_USERNAME" \
    --params.login.password="$OSIO_PASSWORD" \
    --params.target.url="${OSIO_URL}" \
    --params.oso.token="${OSO_TOKEN}" \
    --params.kc.token="${OSIO_REFRESH_TOKEN}" \
    --params.github.username="${GITHUB_USERNAME}" \
    --params.oso.username="${OSO_USERNAME}"
  local test_result=$?

  [[ "$CAT_LOGFILE" == "true" ]]&& show_logs "$log_file"


  # Return test result
  if [ $test_result -eq 0 ]; then
    log.pass 'Functional tests OK'
  else
    log.fail 'Functional tests FAIL'
  fi

  exit $test_result
}

main "$@"
