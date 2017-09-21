## Print OpenShift resources - intended to assist in debugging failed tests

## Parameters
## $1 = user/project name in OpenShift
## $2 = OpenShift web console token

## Step 1 - Access OpenShift 
./oc login https://api.starter-us-east-2.openshift.com --token=$2

## Step 2 - Print OpenShift resources

echo "*****************************************************"

echo "Openshift build configs: "
oc export bc

echo "OpenShift stage deployments: "
oc get deploy -n $1-stage

echo "OpenShist stage pods: "
oc get pod -n $1-stage

echo "*****************************************************"


