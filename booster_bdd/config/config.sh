#!/bin/bash

# Do not display secrets
set +x

export SCENARIO=${SCENARIO:-}

# Endpoints
## Main URI
export SERVER_ADDRESS="${SERVER_ADDRESS:-https://openshift.io}"

## URI of the Openshift.io's forge server
export FORGE_API="${FORGE_API:-https://forge.api.openshift.io}"

## URI of the Openshift.io's API server
export WIT_API="${WIT_API:-https://api.openshift.io}"

## URI of the Openshift.io's Auth server
export AUTH_API="${AUTH_API:-https://auth.openshift.io}"

# Login config
## Openshift.io user's name
export OSIO_USERNAME="${OSIO_USERNAME:-}"

## Openshift.io user's password
export OSIO_PASSWORD="${OSIO_PASSWORD:-}"

## OSO API server
if [ -z "$OSO_CLUSTER_ADDRESS" ]; then
	OSO_CLUSTER_ADDRESS=$(curl -X GET --header 'Accept: application/json' "$WIT_API/api/users?filter\\[username\\]=$OSIO_USERNAME" | jq '.data[0].attributes.cluster')
	OSO_CLUSTER_ADDRESS="${OSO_CLUSTER_ADDRESS//\"/}"
	OSO_CLUSTER_ADDRESS="${OSO_CLUSTER_ADDRESS%/}"
	export OSO_CLUSTER_ADDRESS
fi

if [ -z "$OSO_USERNAME" ] || [ -z "$OSO_TOKEN" ] || [ -z "$GITHUB_USERNAME" ]; then
	## Login to OSO to get OSO username and token
	oc login "$OSO_CLUSTER_ADDRESS" -u "$OSIO_USERNAME" -p "$OSIO_PASSWORD"
	if [ $? -gt 0 ]; then
		echo "ERROR: Unable to login user $OSIO_USERNAME"
		exit 1
	fi

	if [ -z "$OSO_USERNAME" ]; then
		## OpenShift Online user's name (remove @ and following chars)
		OSO_USERNAME=$(oc whoami | sed -e 's/@[^\@]*$//')
		export OSO_USERNAME
	fi

	if [ -z "$OSO_TOKEN" ]; then
		## OpenShift Online token
		OSO_TOKEN=$(oc whoami -t)
		export OSO_TOKEN
	fi

	if [ -z "$GITHUB_USERNAME" ]; then
		## Make sure you are on the main project
		oc project "$OSO_USERNAME"

		## Github username
		GITHUB_USERNAME=$(oc get secrets/cd-github -o yaml | grep username | sed -e 's,.*username: \(.*\),\1,g' | base64 --decode)
		export GITHUB_USERNAME
	fi
fi

## Enable/disable danger zone - features tagged as @osio.danger-zone (e.g. reset user's environment).
## (default value is "false")
export OSIO_DANGER_ZONE="${OSIO_DANGER_ZONE:-false}"

### A behave tag to enable/disable features tagged as @osio.danger-zone (e.g. reset user's environment).
if [ "$OSIO_DANGER_ZONE" == "true" ]; then
	export BEHAVE_DANGER_TAG="@osio.danger-zone"
else
	export BEHAVE_DANGER_TAG="~@osio.danger-zone"
fi

## OpenShift.io booster mission
export BOOSTER_MISSION="${BOOSTER_MISSION:-rest-http}"

## OpenShift.io booster runtime
export BOOSTER_RUNTIME="${BOOSTER_RUNTIME:-vert.x}"

## true for the blank booster
export BLANK_BOOSTER="${BLANK_BOOSTER:-false}"

## OpenShift.io pipeline release strategy
export PIPELINE="${PIPELINE:-maven-releasestageapproveandpromote}"

## github repo name
export GIT_REPO="${GIT_REPO:-test123}"

## OpenShift.io project name
export PROJECT_NAME="${PROJECT_NAME:-test123}"

## A default client_id for the OAuth2 protocol used for user login
## (See https://github.com/fabric8-services/fabric8-auth/blob/d39e42ac2094b67eeaec9fc69ca7ebadb0458cea/controller/authorize.go#L42)
export AUTH_CLIENT_ID="${AUTH_CLIENT_ID:-740650a2-9c44-4db5-b067-a3d1b2cd2d01}"

## An output directory where the reports will be stored
export REPORT_DIR=${REPORT_DIR:-target}

## 'true' if the UI parts of the test suite are to be run in headless mode (default value is 'true')
export UI_HEADLESS=${UI_HEADLESS:-true}
