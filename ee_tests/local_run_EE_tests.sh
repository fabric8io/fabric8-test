#!/bin/bash

set -eu -o pipefail

declare -r SCRIPT_PATH=$(readlink -f "$0")
declare -r SCRIPT_DIR=$(cd $(dirname "$SCRIPT_PATH") && pwd)

source "$SCRIPT_DIR/common.inc.sh"

# add all node binaries to path
export PATH="$PATH:$(npm bin)"

start_webdriver() {
  local log_file="$1"; shift

  # Start selenium server just for this test run
  log.info "Starting Webdriver and Selenium..."
  log.info "Webdriver will log to:$GREEN $log_file"

  webdriver-manager start --versions.chrome 2.33 >> "$log_file" 2>&1 &

  # webdriver-manager command commented out to save time - only needed periodically
  # lets make sure we use the local protractor webdriver-manager

  # Download dependencies
  # echo -n Updating Webdriver and Selenium...
  # node_modules/protractor/bin/webdriver-manager update

}

webdriver_running() {
  curl --output /dev/null --silent --head --fail 127.0.0.1:4444
}

wait_for_webdriver() {
  log.info "Waiting for the webdriver to start ..."

  # Wait for port 4444 to be listening connections
  ##### while ! (nc -w 1 127.0.0.1 4444 </dev/null >/dev/null 2>&1); do sleep 1; done

  until webdriver_running ; do
    sleep 1
    echo -n .
  done

  echo
  log.info "Webdriver manager up and running $GREEN OK"

  # Cleanup webdriver-manager and web app processes
  script.on_exit fuser -k -n tcp 4444
  script.on_exit fuser -k -n tcp 8088
}

validate_test_config() {
  local key="$1"; shift
  local value="${1:-}"; shift

  has_value "$value" && return 0
  log.error "invalid test config ${GREEN}$key${RESET}: $YELLOW'$value'${RESET}"
  return 1
}



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

  start_webdriver "$log_file"
  wait_for_webdriver

  # Finally run protractor
  log.info Running protractor test suite "$PROTRACTOR_CONFIG_JS" \
    with OpenShift username $OSO_USERNAME and \
    GitHub username $GITHUB_USERNAME  \
    on server $OSIO_URL  ...

  protractor "$PROTRACTOR_CONFIG_JS" \
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
