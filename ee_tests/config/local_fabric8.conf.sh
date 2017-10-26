# Test config for running e2e tests against fabric8 installed locally

# openshift.io credentials
export OSIO_USERNAME="${OSIO_USERNAME:-developer}"
export OSIO_PASSWORD="${OSIO_PASSWORD:-dev}"
export OSIO_URL="${OSIO_URL:-http://fabric8-fabric8.$(minishift ip).nip.io}"

## NOTE: this must be set
export OSIO_REFRESH_TOKEN="${OSIO_REFRESH_TOKEN:-}"

# openshift origin
export OSO_USERNAME="${OSO_USERNAME:-developer}"
export OSO_TOKEN="${OSO_TOKEN:-$(oc whoami --show-token)}"

# github
## NOTE: must set this or the validation will fail
export GITHUB_USERNAME="${GITHUB_USERNAME:-}"

# test params

# the protractor file conf file to used for test
export PROTRACTOR_CONFIG_JS="${PROTRACTOR_CONFIG_JS:-protractorEE-fabric8.config.js}"

export TEST_SUITE="${TEST_SUITE:-runTest}"
export TEST_PLATFORM="${TEST_PLATFORM:-fabric8-openshift}"
export TEST_QUICKSTART="${TEST_QUICKSTART:-'Vert.x - Basic'}"

export DISABLE_CHE_CHECKS="${DISABLE_CHE_CHECKS:-true}"
