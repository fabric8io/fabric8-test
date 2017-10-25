# Test config for running e2e tests against remote osio
# openshift.io credentials
export OSIO_USERNAME="${OSIO_USERNAME:-}"
export OSIO_PASSWORD="${OSIO_PASSWORD:-}"
export OSIO_URL="${OSIO_URL:-https://openshift.io}"

# TODO: write how to get this
export OSIO_REFRESH_TOKEN="${OSIO_REFRESH_TOKEN:-}"

# openshift origin
export OSO_USERNAME="${OSO_USERNAME:-}"

# how to obtain this
# log into OSO
# Run: oc whoami --show-token
export OSO_TOKEN="${OSO_TOKEN:-}"

# github
export GITHUB_USERNAME="${GITHUB_USERNAME:-}"


# test params

export PROTRACTOR_CONFIG_JS="${PROTRACTOR_CONFIG_JS:-protractorEE.config.js}"

export TEST_SUITE="${TEST_SUITE:-runTest}"
export TEST_PLATFORM="${TEST_PLATFORM:-fabric8-openshift}"
export TEST_QUICKSTART="${TEST_QUICKSTART:-'Vert.x - Basic'}"


export DISABLE_CHE_CHECKS="${DISABLE_CHE_CHECKS:-false}"

