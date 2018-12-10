#!/bin/bash
############################
# $1 - user name           #
# $2 - active token        #
#                          # 
############################

ACTIVE_TOKEN=$2

if [[ $1 = *"preview"* ]]; then
  CHE_SERVER_URL="https://che.prod-preview.openshift.io"
else
  CHE_SERVER_URL="https://che.openshift.io"
fi

curl -s -H "Authorization: Bearer $ACTIVE_TOKEN " -X GET $CHE_SERVER_URL/api/workspace\?maxItems\=1000 | jq --raw-output ".[].id" | xargs -I % curl -s -H "Authorization: Bearer $ACTIVE_TOKEN" -X DELETE $CHE_SERVER_URL/api/workspace/%
