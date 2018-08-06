#!/bin/bash
echo --- Get cluster for user ---

export OC_CLUSTER_URL=$(curl -X GET --header 'Accept: application/json' "https://api.openshift.io/api/users?filter\[username\]=$1" | jq '.data[0].attributes.cluster')
OC_CLUSTER_URL=$(echo "${OC_CLUSTER_URL//\"/}")

echo --- Using cluster $OC_CLUSTER_URL ---

echo --- Login ---
oc login -u $1 -p $2 $OC_CLUSTER_URL

echo --- Change to Jenkins project ---
oc project $(oc projects -q | grep jenkins)

echo --- List pods ---
oc get pods 



