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
        echo "==> 1. Check token is valid for Forge"
        isTokenValid=$(curl --header "Authorization: Bearer $2" https://forge.api.openshift.io/forge/commands/fabric8-import-git | grep -c 'java.lang.IllegalStateException')
        if [ "$isTokenValid" -gt "0" ]; then 
            echo "==> Invalid token, please logout/login again."
            exit;
        fi
        echo "==> 2. start pre-requisites: create space WIZARD..."
        pyresttest https://api.openshift.io get_a_space.yaml --vars="{'token': '$2', 'userid': '$1', 'space_name_var': 'WIZARD'}" #--interactive true #--print-headers true
        echo "==> 3. start forge api testing..."
        #pyresttest https://api.openshift.io gihub_step.yaml --vars="{'token': '$2', 'userid': '$1'}" #--interactive true #--print-headers true 
        hasGitOrganisation=$(curl --header "Authorization: Bearer $2" https://forge.api.openshift.io/forge/commands/fabric8-import-git | grep -c 'GithubImportPickOrganisationStep')
        if [ "$hasGitOrganisation" -gt "0" ]; then 
            echo "==> Username belongs to a github organisation: $hasGitOrganisation"
            pyresttest https://forge.api.openshift.io API_forge_wizard.yaml --vars="{'token': '$2', 'userid': '$1', 'space_name_var': 'WIZARD'}" #--interactive true --print-headers true

        else
            echo "==> Username doesn't belong to any github organisation: $hasGitOrganisation"
            pyresttest https://forge.api.openshift.io API_forge_wizard_no_gh_organisation.yaml --vars="{'token': '$2', 'userid': '$1', 'space_name_var': 'WIZARD'}" #--interactive true --print-headers true
        fi
    fi
fi
