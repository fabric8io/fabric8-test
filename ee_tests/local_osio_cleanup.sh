## Delete/cleanup OpenShift.io resources

## Parameters::::::
## $1 = userID in OpenShift.io
## $2 = Passwordfor userID in OpenShift.io
##
## ex: sh ./local_osio_cleanup.sh OSIO_USER_ID OSIO_USER_PASSWORD
echo ""
echo "************************** WARNING WARNING WARNING ************************** "
echo "************************** WARNING WARNING WARNING ************************** "
echo ""
echo "This script will delete ALL of the specified user's OpenShift.io data !"
echo "YES, ALL OF IT; there is no recovery !!!"
echo "This is your only chance to Confirm (Yy) or Cancel (Nn)"
echo ""
echo "************************** WARNING WARNING WARNING ************************** "
echo "************************** WARNING WARNING WARNING ************************** "
echo ""

read -p "************* Are you sure? (Yy|Nn)" -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]
then

## Step 1 - Access OpenShift.io
oc login https://console.starter-us-east-2.openshift.com --username=$1 --password=$2

## Step 2 - Delete/cleanup OpenShift.io assets

oc delete all,pvc,cm --all -n $1-run
oc delete all,pvc,cm --all -n $1-stage
oc delete all,pvc,cm --all -n $1-che
oc delete all,pvc,cm --all -n $1
oc delete all,pvc,cm --all -n $1-jenkins

echo ""
echo "************************** OSIO CLEAN-UP COMPLETE!! ************************** "
echo "************************** YOU ARE GOOD TO START OVER ************************** "

fi


