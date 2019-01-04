#!/usr/bin/env bash

# Basic test to install/build boosters on OpenShift

# Parameters

display_usage() { 
	echo "This script requires (4) parameters: OpenShift username, OpenShift password, OpenShift API URL, OpenShift project." 
	echo -e "\nUsage:\n  upstream_booster_test.sh USERNAME PASSWORD https://api.starter-us-east-2a.openshift.com osio-ci-boost1-preview-stage\n" 
	} 

# if less than 4 arguments supplied, display usage 
if [  $# -le 3 ] 
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

OS_USERNAME=$1
OS_PASSWORD=$2
API_URL=$3     # Example: https://api.starter-us-east-2a.openshift.com
OSO_PROJECT=$4 # Example: osio-ci-boost1-preview-stage

# Define the boosters and their corresponding repo names (script assumes all are in github)

declare -a boostername_array=(
"golang-health-check"
"nodejs-rest-http"
"nodejs-health-check"
"nodejs-configmap-redhat"
"nodejs-configmap"
"nodejs-rest-http-crud"
"nodejs-rest-http-secured-redhat"
"nodejs-health-check-redhat"
"nodejs-rest-http-crud-redhat"
"nodejs-rest-http-redhat"
"nodejs-rest-http-secured"
)

declare -a boosterrepo_array=(
"golang-starters"
"nodeshift-starters"
"nodeshift-starters"
"nodeshift-starters"
"nodeshift-starters"
"nodeshift-starters"
"nodeshift-starters"
"nodeshift-starters"
"nodeshift-starters"
"nodeshift-starters"
"nodeshift-starters"
)

# get length of an array
arraylength=${#boostername_array[@]}

# use for loop to read all values and indexes
for (( i=1; i<${arraylength}+1; i++ ));
do
  echo $i " / " ${arraylength} " : " ${boostername_array[$i-1]} " : " ${boosterrepo_array[$i-1]};
  sh ./prebooster.sh $OSO_PROJECT ${boostername_array[$i-1]} $API_URL ${boosterrepo_array[$i-1]} $OS_USERNAME $OS_PASSWORD;
done




