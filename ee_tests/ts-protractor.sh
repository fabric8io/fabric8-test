#!/bin/bash
set -e -u -o pipefail

declare -r SCRIPT_PATH=$(readlink -f "$0")
declare -r SCRIPT_DIR=$(cd $(dirname "$SCRIPT_PATH") && pwd)

source "$SCRIPT_DIR/common.inc.sh"

validate_config() {
  local ret=0
  validate_test_config OSIO_USERNAME "$OSIO_USERNAME" || ret=1
  validate_test_config OSIO_PASSWORD "$OSIO_PASSWORD" || ret=1
  return $ret
}


main() {
  local suite=${1:-specs}

  source "$SCRIPT_DIR/config/local_osio.conf.sh"
  validate_config || {
    log.info "Please set test configs and re-run $0"
    exit 1
  }

  # NOTE: DO NOT start and kill webdriver if it is aleady started
  webdriver_running || {
    local log_file="${SCRIPT_DIR}/webdriver.log"
    start_webdriver "$log_file"
    wait_for_webdriver
  }

  log.info "Running tsc ... "
  tsc || {
    log.warn "ts -> js compilation failed; fix it and rerun $0"
    exit 1
  }

  local protractor="$(npm bin)/protractor"

  [[ ${NODE_DEBUG:-false} == true ]] && protractor="node --inspect --debug-brk $protractor"

  # TODO: may be target.url isn't needed at all since baseUrl can be set
  # using --baseUrl

  # NOTE: do NOT quote $protractor as we want spaces to be interpreted as
  # seperate arguments
  $protractor --baseUrl "$OSIO_URL" protractorTS.config.js \
    --suite "${suite}" \
    --params.login.user="$OSIO_USERNAME" \
    --params.login.password="$OSIO_PASSWORD" \
    --params.target.url="${OSIO_URL}" \
    --params.oso.token="${OSO_TOKEN}" \
    --params.kc.token="${OSIO_REFRESH_TOKEN}" \
    --params.github.username="${GITHUB_USERNAME}" \
    --params.oso.username="${OSO_USERNAME}"

  return $?
}

main "$@"
