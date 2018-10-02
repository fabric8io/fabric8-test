#!/bin/bash

# Add the current directory to Go path.
GOPATH="$GOPATH:$(pwd)"
export GOPATH

# A name of the consumer in the contract.
export PACT_CONSUMER="${PACT_CONSUMER:-OsioStatusConsumer}"

# A name of the provider in the contract.
export PACT_PROVIDER="${PACT_PROVIDER:-OsioStatusProvider}"

# A contract version.
export PACT_VERSION="${PACT_VERSION:-1.0.0}"

# A Pact broker to store and share pact files.
export PACT_BROKER_URL="${PACT_BROKER_URL:-}"

# A provider base url (default `https://openshift.io`)
export PACT_PROVIDER_BASE_URL="${PACT_PROVIDER_BASE_URL:-https://openshift.io}"
