## Delete/cleanup OpenShift assets

oc login https://api.starter-us-east-2.openshift.com --token=$2

oc delete bc --all -n $1
oc delete build --all -n $1

oc delete build --all -n $1-stage
oc delete service --all -n $1-stage
oc delete bc --all -n $1-stage
oc delete dc --all -n $1-stage
oc delete pod --all -n $1-stage
oc delete route --all -n $1-stage
oc delete imagestream --all -n $1-stage

oc delete build --all -n $1-run
oc delete service --all -n $1-run
oc delete bc --all -n $1-run
oc delete dc --all -n $1-run
oc delete pod --all -n $1-run
oc delete route --all -n $1-run
oc delete imagestream --all -n $1-run

oc delete build --all -n $1-jenkins
oc delete bc --all -n $1-jenkins
oc delete imagestream --all -n $1-jenkins







