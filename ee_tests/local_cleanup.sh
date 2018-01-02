#!/bin/bash

## Delete/cleanup OpenShift resources

## Parameters
## $1 = user/project name in OpenShift
## $2 = OpenShift web console token

export PATH=$PATH:.

echo "*****************************************************"
echo "Pre-test cleanup - Delete build configs and deployment configd from OSO"

## Step 1 - Access OpenShift 
oc login https://api.starter-us-east-2.openshift.com --token=$2

## Step 3 - Delete OpenShift resources
#oc delete all,pvc,cm,secrets,sa --all -n $1
#oc delete all,pvc,cm,secrets,sa --all -n $1-che
#oc delete all,pvc,cm,secrets,sa --all -n $1-jenkins
#oc delete all,pvc,cm,secrets,sa --all -n $1-run
#oc delete all,pvc,cm,secrets,sa --all -n $1-stage

oc delete bc --all -n $1
oc delete all,pvc,cm --all -n $1-che
#oc delete all,pvc,cm --all -n $1-jenkins
oc delete all,pvc,cm --all -n $1-run
oc delete all,pvc,cm --all -n $1-stage

echo "*****************************************************"

