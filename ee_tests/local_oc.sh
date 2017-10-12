#!/bin/bash

## Delete/cleanup OpenShift resources

## Parameters
## $1 = user/project name in OpenShift
## $2 = OpenShift web console token
## $3 = OpenShift project

export PATH=$PATH:.

## Step 1 - Access OpenShift 
oc login https://api.starter-us-east-2.openshift.com --token=$2
oc project $1-$3
oc get -o wide pods 

for POD in `oc get pods | grep $3 | cut -d ' ' -f 1`; do echo "------>Log file for: " $POD; oc logs --timestamps=true $POD; done

for POD in `oc get pods | grep $3 | cut -d ' ' -f 1`; do echo $POD; oc logs $POD | grep -e ERROR -e SEVERE; done


