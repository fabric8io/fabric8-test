#!/bin/bash
########################################################################################
# Script for retrieving information from Openshift using oc commands                   #
# $1 - username                                                                        #
# $2 - password                                                                        #                                                                  #
########################################################################################

# stop the script when any command fails
set -e

echo ---------- Get cluster for user --------------------

if [[ $1 = *"preview"* ]]; then
  API_SERVER_URL="https://api.prod-preview.openshift.io"
else
  API_SERVER_URL="https://api.openshift.io"
fi

OC_CLUSTER_URL=$(curl -s -X GET --header 'Accept: application/json' "$API_SERVER_URL/api/users?filter\\[username\\]=$1" | jq '.data[0].attributes.cluster')
OC_CLUSTER_URL="$(echo "${OC_CLUSTER_URL//\"/}")"

echo "Using cluster $OC_CLUSTER_URL"

echo ---------- Login -----------------------------------
oc login -u $1 -p $2 "$OC_CLUSTER_URL"

echo ---------- Change to $1 project ---------------
echo "oc project" $1
oc project $1

echo ---------- List all routes ----------------------
echo "oc get route"
oc get route

echo ---------- Create route ----------------------
echo "oc apply -f route.yml"
oc apply -f route.yml

echo ---------- Get route host ----------------------
echo "oc get route -o jsonpath='{.items[0].spec.host}'"
ROUTE_URL=`oc get route -o jsonpath='{.items[0].spec.host}'`
echo "Route URL is " $ROUTE_URL

echo ---------- Wait for route to be available ----------------------
# do stop the script when any command fails
set +e
function wait_for_route {
    i=1
    max=300
    while [ $i -le $max ]; do
        RESPONSE_CODE=`curl -sL -w "%{http_code}" -I $ROUTE_URL -o /dev/null`
        if [ ! $RESPONSE_CODE -eq 200 ]; then
            if [ $i -eq $max ]; then
                echo "Route was not available in more than 5 minutes"
                exit 5
            fi
            sleep 1
            ((i++))
        else
            break
        fi
    done
}
time wait_for_route

