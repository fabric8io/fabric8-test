#!/bin/bash
set -e -u -o pipefail

declare -r SCRIPT_PATH=$(readlink -f "$0")
declare -r SCRIPT_DIR=$(cd $(dirname "$SCRIPT_PATH") && pwd)

source "$SCRIPT_DIR/common.inc.sh"

webdriver_running() {
  curl --output /dev/null --silent --head --fail 127.0.0.1:4444
}


main() {
  local suite=${1:-specs}

  webdriver_running || {
    log.info 'Run: npm run webdriver:start 2>&1 | tee webdriver.log'
    log.fail "Can't proceed - no webdriver running"
    exit 1
  }

  source "$SCRIPT_DIR/config/local_osio.conf.sh"

  "$(npm bin)/protractor" protractorTS.config.js \
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
