#!/bin/bash

## Delete/cleanup Che resources

## Parameters
## $1 = github username
## $2 = KC Refresh token
##
## ex: sh ./local_cleanup_che.sh USERNAME KC_REFRESH_TOKEN 

## Delete Che workspaces

# Do not reveal secrets
set -x

# Do not exit on failure so that artifacts can be archived
set +e

ACCEPT_TOKEN=`curl -H "Content-Type: application/json" -X POST -d "{\"refresh_token\":\"$2\"}" https://auth.openshift.io/api/token/refresh | grep -oP '"access_token":"[\S]+"' | sed 's/"access_token":"//g' | sed 's/","expires_in.*//'`

WORKSPACES=`curl -L --header "Authorization: Bearer $ACCEPT_TOKEN" http://che-$1-che.8a09.starter-us-east-2.openshiftapps.com/api/workspace | grep -oP '"id":"[\w-]+' | sed 's/,"id":"//g' `


echo "*****************************************************"
echo "Pre-test cleanup - Delete old workspaces from Che"

echo "Che workspaces to be deleted="$WORKSPACES

for workspace in $WORKSPACES; 
do
    echo "stopping workspace "$workspace
    curl -LX DELETE -H "Authorization: Bearer $ACCEPT_TOKEN" https://che-$1-che.8a09.starter-us-east-2.openshiftapps.com/api/workspace/$workspace/runtime
    echo "deleting workspace "$workspace
    curl -LX DELETE -H "Authorization: Bearer $ACCEPT_TOKEN" https://che-$1-che.8a09.starter-us-east-2.openshiftapps.com/api/workspace/$workspace
done
echo "*****************************************************"

