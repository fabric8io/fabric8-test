#!/bin/bash

echo "Invoking Che test script here..."

# -DosioUrlPart=$1           os.getenv("SERVER_ADDRESS")
# -DosioUsername=$2          os.getenv("OSIO_USERNAME")
# -DosioPassword=$3          os.getenv("OSIO_PASSWORD")
# -DcheWorkspaceName=$4      workspaceName
# -DkeycloakToken=$5         theToken

set +x

# Script to execute: che-functional-tests/cico/run_EE_suite.sh
##git clone --depth 1 git@github.com:redhat-developer/che-functional-tests.git
##cd che-functional-tests
##mvn clean install -f pom.xml -DskipTests
##mvn clean verify -f tests/pom.xml -Dtest=E2ETestSuite -DosioUrlPart=$1 -DosioUsername=$2 -DosioPassword=$3 -DcheWorkspaceName=$4 -DkeycloakToken=$5 -DpreserveWorkspace=true

# example:
# mvn clean verify -f tests/pom.xml -Dtest=E2ETestSuite -DosioUrlPart=openshift.io -DosioUsername=$OSIO_USERNAME -DosioPassword=$OSIO_PASSWORD -DcheWorkspaceName=aug2test1-shw0q -DkeycloakToken=$THE_TOKEN -DpreserveWorkspace=true

exit 0

