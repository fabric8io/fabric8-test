#!/bin/bash

. ./config/config.sh

pact-provider-verifier "$PACT_BROKER_URL/pacts/provider/$PACT_PROVIDER/consumer/$PACT_CONSUMER/versions/$PACT_VERSION" --provider-base-url "$PACT_PROVIDER_BASE_URL"
