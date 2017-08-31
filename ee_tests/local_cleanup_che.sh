#!/bin/bash

## Delete/cleanup Che resources

## Parameters
## $1 = github username
## $2 = OSIO token
##
## ex: sh ./local_cleanup_che.sh USERNAME KC_TOKEN 

## Delete Che workspaces

# Do not reveal secrets
set +x

# Do not exit on failure so that artifacts can be archived
set +e

WORKSPACES=`curl -L --header "Authorization: Bearer $2" http://che-$1-che.8a09.starter-us-east-2.openshiftapps.com/api/workspace |  grep -oP '"id":"[\w-]+' | sed 's/"id":"//g'`

echo $WORKSPACES

for workspace in $WORKSPACES; 
do
    echo "stopping workspace "$workspace
    curl -vLX DELETE -H "Authorization: Bearer $2" https://che-$1-che.8a09.starter-us-east-2.openshiftapps.com/api/workspace/$workspace/runtime
    echo "deleting workspace "$workspace
    curl -vLX DELETE -H "Authorization: Bearer $2" https://che-$1-che.8a09.starter-us-east-2.openshiftapps.com/api/workspace/$workspace
done

