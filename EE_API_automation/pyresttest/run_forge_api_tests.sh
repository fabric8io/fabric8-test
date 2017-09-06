#!/bin/bash
if test ! $(which pyresttest)
then
	echo "==> check pre-requisites: python and pyresttest should be installed"
else
    if [ -z "$1" ] 
    then
        echo "No OSIO username supplied - usage: run_forge_api YOUR_OSIO_USERNAME YOUR_KEYCLOAK_TOKEN"
    elif [ -z "$2" ] 
    then
        echo "No OSIO auth token supplied - usage: run_forge_api YOUR_OSIO_USERNAME YOUR_KEYCLOAK_TOKEN"
    else
        echo "==> running pyresttest with token: $1 and username: $2"
        echo "==> 1. start pre-requisites: create sapce WIZARD..."
        pyresttest https://api.openshift.io get_a_space.yaml --vars="{'token': '$2', 'userid': '$1', 'fixedspacename': 'WIZARD'}" #--interactive true
        echo "==> 2. start forge api testing..."
        pyresttest https://forge.api.openshift.io API_forge_wizard.yaml --vars="{'token': '$2', 'userid': '$1', 'fixedspacename': 'WIZARD'}" #--interactive true
    fi
fi
