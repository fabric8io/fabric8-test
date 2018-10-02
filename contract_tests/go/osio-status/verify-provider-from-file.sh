#!/bin/bash

. ./config/config.sh

pact-provider-verifier pacts/osiostatusconsumer-osiostatusprovider.json --provider-base-url "$PACT_PROVIDER_BASE_URL"
