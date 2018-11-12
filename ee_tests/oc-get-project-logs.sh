#!/bin/bash
########################################################################################
# Script for retrieving information from Openshift using oc commands                   #
# $1 - username                                                                        #
# $2 - password                                                                        #
# $3 - project suffix (e.g. che, jenkins)                                              #
# $4 - JWT token                                                                       #
########################################################################################

# stop the script when any command fails
set -e

echo ---------- Get cluster for user --------------------

if [[ $1 = *"preview"* ]]; then
  API_SERVER_URL="https://api.prod-preview.openshift.io"
  CHE_SERVER_URL="https://che.prod-preview.openshift.io"
else
  API_SERVER_URL="https://api.openshift.io"
  CHE_SERVER_URL="https://che.openshift.io"
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
echo "oc get events --sort-by='.lastTimestamp'"
oc get events --sort-by='.lastTimestamp'

if [ "$3" == "jenkins" ]; then
  echo ---------- Jenkins version -------------------------
  echo "oc get -o custom-columns=NAME:.metadata.name,LABELS_VERSION:.metadata.labels.version deploymentconfigs"
  oc get -o custom-columns=NAME:.metadata.name,LABELS_VERSION:.metadata.labels.version deploymentconfigs

  echo ---------- Jenkins deployment config ---------------
  echo "oc get -o yaml dc/jenkins"
  oc get -o yaml dc/jenkins

  echo ---------- Get jenkins pod logs ----------------
  echo "oc get pods --field-selector=status.phase=Running -o name | grep -v 'slave|deploy' | grep -m1 jenkins"
  POD_NAMES=`oc get pods --field-selector=status.phase=Running -o name | grep -v 'slave|deploy' | grep -m1 jenkins`

  if [[ -z "$POD_NAMES" ]]; then
    echo "No running jenkins pods"
  else
    echo "oc logs" $POD_NAMES
    oc logs $POD_NAMES
  fi
fi

if [ "$3" == "che" ] && [ ! -z "$4" ]; then
  echo ---------- Get the list of workspaces ----------
  echo "\$(curl -s -X GET --header 'Accept: application/json' --header 'Authorization: Bearer <token>' \
    $CHE_SERVER_URL/api/workspace?maxItems=1000)"
  RESPONSE=$(curl -s -X GET --header "Accept: application/json" --header "Authorization: Bearer $4" \
    "$CHE_SERVER_URL/api/workspace?maxItems=1000")
  echo "Number of existing workspaces: $(echo $RESPONSE | jq '. | length')"
  echo "List of existing workspaces:"
  echo $RESPONSE | jq '.[] | {workspace_name: .config.name, project_name: .config.projects[].name}'
fi

echo ---------- Get build name ----------------
echo "oc get builds -n $1 | awk '{print \$1}' | tail -1"
buildName=$(oc get builds -n $1 | awk '{print $1}' | tail -1)

if [ ! -z $buildName ]; then
  echo ---------- Get build $buildName ---------------
  echo "oc get build/$buildName -n $1 -o yaml"
  oc get build/$buildName -n $1 -o yaml
fi

echo ---------- Script finished -------------------------
