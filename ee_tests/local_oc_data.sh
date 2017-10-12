#!/bin/bash

# Do not reveal secrets
set +x

## Print OpenShift resources - intended to assist in debugging failed tests

## Parameters
## $1 = user/project name in OpenShift
## $2 = OpenShift web console token

export PATH=$PATH:.

## Step 1 - Access OpenShift 
oc login https://api.starter-us-east-2.openshift.com --token=$2

## Step 2 - Print OpenShift resources

echo "*****************************************************"
echo "Dump of OSO resource information - current state at time of failure"

echo "---------------------------------------------"
echo "Openshift build configs: "
oc export bc
echo "---------------------------------------------"

echo "OpenShift stage deployment configs: "
oc get dc -n $1-stage
echo "---------------------------------------------"

echo "OpenShift stage pods: "
oc get pod -n $1-stage
echo "---------------------------------------------"

echo "OpenShift run deployment configs: "
oc get dc -n $1-run
echo "---------------------------------------------"
 
echo "OpenShift run pods: "
oc get pod -n $1-run
echo "---------------------------------------------"

echo "OpenShift get buildconfig"
oc get buildconfig 
echo "---------------------------------------------"

echo "OpenShift get build"
oc get build

echo "*****************************************************"
