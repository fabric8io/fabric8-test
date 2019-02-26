#!/usr/bin/env bash

# Basic test to verify that an upstream booster can be built and deployed to OpenShift. 
# Test relies only on oc commands to avoid the need for installing UI test harness such as Protractor

# Do not display secrets
set +x

# Handle Script parameters

PROJECT_NAME=$PROJECT_NAME  # Example: username-stage
BOOSTER_NAME=$BOOSTER_NAME  # Example: nodejs-rest-http
CLUSTER=$CLUSTER            # Example: https://api.starter-us-east-2a.openshift.com
BOOSTER_REPO=$BOOSTER_REPO  # Example: nodeshift-starters
OS_USERNAME=$OS_USERNAME
OS_PASSWORD=$OS_PASSWORD

# Login to OpenShift oc
echo ""
echo "====== Login to OpenShift oc"
oc login $CLUSTER --username=$OS_USERNAME --password=$OS_PASSWORD
TOKEN=`oc whoami -t`
oc login $CLUSTER --token=$TOKEN

# Change to the stage project
echo ""
echo "====== Change to selected OSO project"
oc project $PROJECT_NAME 

# Reset the user/project environment
echo ""
echo "====== Cleanup the user/project environment"
oc delete all -l app=$BOOSTER_NAME 
oc delete build --all
oc delete bc --all
oc delete dc --all
oc delete deploy --all
oc delete is --all
oc delete istag --all
oc delete isimage --all
oc delete job --all
oc delete po --all
oc delete rc --all
oc delete rs --all
oc delete statefulsets --all
oc delete configmap --all
oc delete services --all
oc delete routes --all
oc delete template --all

# Create the new app
echo ""
echo "====== Create the new app"

# Explicitly reference the boosters' application.yaml file - so as to not rely on any default values 
# Example oc new-app command syntax:
# oc new-app -f https://raw.githubusercontent.com/golang-starters/golang-health-check/master/.openshiftio/application.yaml 
#    -p SOURCE_REPOSITORY_URL=https://github.com/golang-starters/golang-health-check

echo "Command = oc new-app -f https://raw.githubusercontent.com/$BOOSTER_REPO/$BOOSTER_NAME/master/.openshiftio/application.yaml -p SOURCE_REPOSITORY_URL=https://github.com/$BOOSTER_REPO/$BOOSTER_NAME"

oc new-app -f https://raw.githubusercontent.com/$BOOSTER_REPO/$BOOSTER_NAME/master/.openshiftio/application.yaml -p SOURCE_REPOSITORY_URL=https://github.com/$BOOSTER_REPO/$BOOSTER_NAME 


if [[ "$BOOSTER_NAME" == *"golang"* ]]; then
    echo "matched";

    # Start the S2I build for the new app
    echo ""
    echo "====== Start the S2I build for the new app"
    oc start-build $BOOSTER_NAME-s2i

else

    # Monitor the log for the new app
    echo ""
    echo "====== Watch the log for the new app build"
    oc logs -f bc/$BOOSTER_NAME

    # Expose a route for the app
    echo ""
    echo "====== Expose a route for/to the new app"
    oc expose svc/$BOOSTER_NAME

    # Deploy the new app
    echo ""
    echo "====== Deploy the new app"
    sleep 10
    oc rollout latest dc/$BOOSTER_NAME
fi

# Obtain the text displayed by the deployed app
echo ""
echo "Pause to enable the app to start, then dump text from app"
#sleep 30

RETRY_COUNTER=0
RETRY_MAX=30

# Loop - Waiting for the app to become available at its deployed endpoint
while [  $RETRY_COUNTER -lt $RETRY_MAX ]; do
    echo "Looking for the deployed app - The counter is $RETRY_COUNTER"
    sleep 10
    let RETRY_COUNTER=RETRY_COUNTER+1 

    curl -s `oc get routes -o jsonpath='{range .items[*].spec}{""}{.host}{"\n"}{end}'` | grep "The application is currently not serving requests at this endpoint." 
    if [ $? = 1 ]
        then
            let RETRY_COUNTER=RETRY_MAX
            sleep 30
    fi
done

# Remove tokens ("grep -v integrity") from output
curl -s `oc get routes -o jsonpath='{range .items[*].spec}{""}{.host}{"\n"}{end}'` | grep -v integrity > ${BOOSTER_NAME}_output.txt

# Compare actual results to expected results
diff ${BOOSTER_NAME}_output.txt ${BOOSTER_NAME}_expected_output.txt

if [ $? = 1 ]
    then 
        RESULT="Fail"
    else 
        RESULT="Success"
fi

echo "Test results for $BOOSTER_NAME: $RESULT" | tee target/results.txt

# Logout from oc
echo ""
echo "====== Logout from oc"
oc logout

cat target/results.txt
grep "Success" target/results.txt
export RTN_CODE=$?
echo $RTN_CODE
exit $RTN_CODE


