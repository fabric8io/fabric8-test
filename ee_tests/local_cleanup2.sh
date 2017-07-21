## Delete/cleanup OpenShift resources

## Parameters
## $1 = user/project name in OpenShift
## $2 = OpenShift web console token
## $3 = github token (must be configured in github web UI to support repo deletion)
## $4 = github username
## $5 = OSIO token
##
## ex: sh ./local_cleanup2.sh osiotest3142 OPENSHIFT_TOKEN GITHUB_TOKEN osiotest3142

## Step 1 - Access OpenShift 
oc login https://api.starter-us-east-2.openshift.com --token=$2

## Step 2 - Delete github repos
export REPOS=`oc get bc -n $1 | grep -v NAME | cut -d " " -f 1`
for repo in $REPOS; do echo "deleting repo " $repo ; curl -X DELETE -H "Authorization: token $3" https://api.github.com/repos/$4/$repo; done

## Step 3 - Delete OpenShift resources
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

## Step 4 - Delete Che workspaces - TODO

workspaces=`curl -L --header 'Authorization: Bearer $5' http://che-osiotest3141-che.8a09.starter-us-east-2.openshiftapps.com/api/workspace | grep -oP '"che","id":"[\w-]+' | sed 's/"che","id":"//g'`

for workspace in $WORKSPACES; 
do echo "deleting workspace " $workspace ; 
curl -vLX DELETE -H 'Authorization: Bearer $5' https://che-osiotest3141-che.8a09.starter-us-east-2.openshiftapps.com/api/workspace/$workspace; 
done

## Step 5 - Delete OSIO spaces - TODO


