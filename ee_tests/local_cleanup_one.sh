#!/bin/bash

## Delete/cleanup OpenShift resources

## Parameters
## $1 = user/project name in OpenShift
## $2 = OpenShift web console token
## $3 = bc to delete

export PATH=$PATH:.

## Step 1 - Access OpenShift 
oc login https://api.starter-us-east-2.openshift.com --token=$2
oc project $1

export count=`oc get bc | grep vertxbasic | wc -l`

if [ $count -gt 0 ]
then
  echo "Deleting bc..."
  # Delete the designated build config
  oc delete bc $3 
fi

