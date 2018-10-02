#!/bin/bash

. ./config/config.sh

PACT_FILE="pacts/osiostatusconsumer-osiostatusprovider.json"

echo "Publishing $PACT_FILE to a Pact broker at $PACT_BROKER_URL"

result=$(curl -L --silent -XPUT -H "Content-Type: application/json" -d@$PACT_FILE "$PACT_BROKER_URL/pacts/provider/$PACT_PROVIDER/consumer/$PACT_CONSUMER/version/$PACT_VERSION")

if [[ $result = *'"consumer":{"name":"'$PACT_CONSUMER'"},"provider":{"name":"'$PACT_PROVIDER'"}'* ]]; then
    echo "Pact successfully published."
else
    echo "Unable to publish pact:"
    echo "$result"
fi
