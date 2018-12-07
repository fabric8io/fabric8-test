#!/bin/bash
########################################################################################
# Script for retrieving information from Openshift using oc commands                   #
# $1 - username                                                                        #
# $2 - password                                                                        #
# $3 - project suffix (e.g. che, jenkins)                                              #
# $4 - JWT token 
########################################################################################

export STRINGTOREMOVE="@redhat.com"

export OC_USERNAME="$1"
export OC_PASSWORD="$2"
export OC_PROJECT_SUFFIX="$3"
export OC_JWT_TOKEN="$4"

# stop the script when any command fails
set -e

echo ---------- Get cluster for user --------------------

if [[ $OC_USERNAME = *"preview"* ]]; then
  API_SERVER_URL="https://api.prod-preview.openshift.io"
  CHE_SERVER_URL="https://che.prod-preview.openshift.io"
else
  API_SERVER_URL="https://api.openshift.io"
  CHE_SERVER_URL="https://che.openshift.io"
fi

OC_CLUSTER_URL=$(curl -s -X GET --header 'Accept: application/json' "$API_SERVER_URL/api/users?filter\\[username\\]=$OC_USERNAME" | jq '.data[0].attributes.cluster')
OC_CLUSTER_URL="$(echo "${OC_CLUSTER_URL//\"/}")"

echo "Using cluster $OC_CLUSTER_URL"

echo ---------- Login -----------------------------------
oc login -u $OC_USERNAME -p $OC_PASSWORD "$OC_CLUSTER_URL"

# In the event that the login username includes a redhat.com email suffix
export OC_USERNAME="${1//$STRINGTOREMOVE/}"

echo ---------- Change to $OC_USERNAME-$OC_PROJECT_SUFFIX project ---------------
echo "oc project" $OC_USERNAME-$OC_PROJECT_SUFFIX
oc project $OC_USERNAME-$OC_PROJECT_SUFFIX

# execute all commands on project
set +e

echo ---------- List all resources ----------------------
echo "oc get all"
oc get all

echo ---------- Get events ---------------
echo "oc get events --sort-by='.lastTimestamp'"
oc get events --sort-by='.lastTimestamp'

if [ "$OC_PROJECT_SUFFIX" == "jenkins" ]; then
  echo ---------- Jenkins version -------------------------
  echo "oc get -o custom-columns=NAME:.metadata.name,LABELS_VERSION:.metadata.labels.version deploymentconfigs"
  oc get -o custom-columns=NAME:.metadata.name,LABELS_VERSION:.metadata.labels.version deploymentconfigs

  echo ---------- Jenkins deployment config ---------------
  echo "oc get -o yaml dc/jenkins"
  oc get -o yaml dc/jenkins

  echo ---------- Get jenkins pod logs ----------------
  echo "oc get pods | grep jenkins | awk '{print \$1}'"
  POD_NAMES=$(oc get pods | grep jenkins | awk '{print $1}')

  if [[ -z "$POD_NAMES" ]]; then
    echo "No running jenkins pods"
  else
    for POD_NAME in $POD_NAMES; do
        echo "---- Pod '$POD_NAME': ----"
        oc logs $POD_NAME
    done
  fi
fi

if [ "$OC_PROJECT_SUFFIX" == "che" ] && [ ! -z "$OC_JWT_TOKEN" ]; then
  echo ---------- Get the list of workspaces ----------
  echo "\$(curl -s -X GET --header 'Accept: application/json' --header 'Authorization: Bearer <token>' \
    $CHE_SERVER_URL/api/workspace?maxItems=1000)"
  RESPONSE=$(curl -s -X GET --header "Accept: application/json" --header "Authorization: Bearer $OC_JWT_TOKEN" \
    "$CHE_SERVER_URL/api/workspace?maxItems=1000")
  echo "Number of existing workspaces: $(echo $RESPONSE | jq '. | length')"
  echo "List of existing workspaces:"
  echo $RESPONSE | jq '.[] | {workspace_name: .config.name, project_name: .config.projects[].name}'

  echo ---------- Get Che pod logs ----------
  echo "oc get pods | grep workspace | awk '{print \$1}'"
  POD_NAMES=$(oc get pods | grep workspace | awk '{print $1}')

  if [[ -z "$POD_NAMES" ]]; then
    echo "No running che pods"
  else
    for POD_NAME in $POD_NAMES; do
        echo "---- Pod '$POD_NAME': ----"
        oc logs $POD_NAME
        echo "Bootstrapper Log:"
        oc exec $POD_NAME -- cat /workspace_logs/bootstrapper/bootstrapper.log
        echo "ws-agent Log:"
        oc exec $POD_NAME -- cat /workspace_logs/ws-agent/logs/catalina.log
    done
  fi
fi

echo ---------- Get build name ----------------
echo "oc get builds -n $OC_USERNAME | awk '{print \$1}' | tail -1"
buildName=$(oc get builds -n $OC_USERNAME | awk '{print $1}' | tail -1)

if [ ! -z $buildName ]; then
  echo ---------- Get build $buildName ---------------
  echo "oc get build/$buildName -n $OC_USERNAME -o yaml"
  oc get build/$buildName -n $OC_USERNAME -o yaml
fi

echo ---------- Script finished -------------------------
