#!/bin/bash
set -x

# oc login...
# oc new-project...

oc create -f pact-broker-template.yml
oc new-app pact-broker