#!/bin/bash
########################################################################################
# Script for retrieving information from Openshift using oc commands                   #
# $1 - username                                                                        #
# $2 - password                                                                        #
# $3 - project suffex (e.g. che, jenkins)                                              #
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

echo ---------- Change to $1-$3 project ---------------
echo "oc project" $1-$3
oc project $1-$3

# execute all commands on project
set +e

echo ---------- List all resources ----------------------
echo "oc get all"
oc get all

echo ---------- Get events ---------------
echo "oc get ev"
oc get ev

if [ "$3" == "jenkins" ]
then
  echo ---------- Jenkins version -------------------------
  echo "oc get -o custom-columns=NAME:.metadata.name,LABELS_VERSION:.metadata.labels.version deploymentconfigs"
  oc get -o custom-columns=NAME:.metadata.name,LABELS_VERSION:.metadata.labels.version deploymentconfigs

  echo ---------- Jenkins deployment config ---------------
  echo "oc get -o yaml dc/jenkins"
  oc get -o yaml dc/jenkins

  echo ---------- Get jenkins pod logs ----------------
  POD_NAMES=`oc get pods --field-selector=status.phase=Running -o name | grep -m1 jenkins`

  if [[ -z "$POD_NAMES" ]]; then
    echo "No running jenkins pods"
  else
    echo "oc logs" $POD_NAMES
    oc logs $POD_NAMES
  fi
fi

echo ---------- Script finished -------------------------
