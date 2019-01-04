#!/usr/bin/env bash

# Basic test to verify that an upstream Go booster can be built and deployed to OpenShift. 
# Test relies only on oc commands to avoid the need for installing UI test harness such as Protractor

# Do not display secrets
set +x

# Handle Script parameters

display_usage() { 
	echo "This script requires (5) parameters: OS project name, booster name, cluster, reoo name string, OS token." 
	echo -e "\nUsage:\n  upstream_booster.sh username-stage boosterName https://api.starter-us-east-NNN.openshift.com nodeshift-starters TOKEN\n" 
	} 

# if less than 5 arguments supplied, display usage 
if [  $# -le 4 ] 
	then 
		display_usage
		exit 1
fi 
 
# check whether user had supplied -h or --help . If yes display usage 
if [[ ( $# == "--help") ||  $# == "-h" ]] 
	then 
		display_usage
		exit 0
fi 

PROJECT_NAME=$1  # Example: username-stage
BOOSTER_NAME=$2  # Example: nodejs-rest-http
CLUSTER=$3       # Example: https://api.starter-us-east-2a.openshift.com
BOOSTER_REPO=$4  # Example: nodeshift-starters
OS_TOKEN=$5

# Login to OpenShift oc
echo ""
echo "====== Login to OpenShift oc"
oc login $CLUSTER --token=$OS_TOKEN

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

# Example oc new-app command syntax:
# oc new-app -f https://raw.githubusercontent.com/golang-starters/golang-health-check/master/.openshiftio/application.yaml 
#    -p SOURCE_REPOSITORY_URL=https://github.com/golang-starters/golang-health-check

echo "Command = oc new-app -f https://raw.githubusercontent.com/$4/$2/master/.openshiftio/application.yaml -p SOURCE_REPOSITORY_URL=https://github.com/$4/$2"

sleep 60
oc new-app -f https://raw.githubusercontent.com/$4/$2/master/.openshiftio/application.yaml -p SOURCE_REPOSITORY_URL=https://github.com/$4/$2 

# Start the S2I build for the new app
echo ""
echo "====== Start the S2I build for the new app"
oc start-build $BOOSTER_NAME-s2i

# Obtain the text displayed by the deployed app
echo ""
echo "Pause to enable the app to start, then dump text from app"
sleep 60

curl -s `oc get routes -o jsonpath='{range .items[*].spec}{""}{.host}{"\n"}{end}'` | grep -v integrity > ${BOOSTER_NAME}_output.txt

diff ${BOOSTER_NAME}_output.txt ${BOOSTER_NAME}_expected_output.txt

if [ $? = 1 ]
	then 
		RESULT="Fail"
	else 
		RESULT="Success"
fi

echo "Test results for $BOOSTER_NAME: $RESULT" >> results.txt


