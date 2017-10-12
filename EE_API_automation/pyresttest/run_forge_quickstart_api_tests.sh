#!/bin/bash
if test ! $(which pyresttest)
then
	echo "==> check pre-requisites: python and pyresttest should be installed"
else
    if [ -z "$1" ] 
    then
        echo "No OSIO username supplied - usage: run_forge_api_tests YOUR_OSIO_USERNAME YOUR_KEYCLOAK_TOKEN"
    elif [ -z "$2" ] 
    then
        echo "No OSIO auth token supplied - usage: run_forge_api_tests YOUR_OSIO_USERNAME YOUR_KEYCLOAK_TOKEN"
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
        hasGitOrganisation=$(curl --header "Authorization: Bearer $2" https://forge.api.openshift.io/forge/commands/fabric8-import-git | grep -c 'GitHubImportPickOrganisationStep')
        if [ "$hasGitOrganisation" -gt "0" ]; then 
            echo "==> Username belongs to a github organisation: $hasGitOrganisation"
            uuid="quickstart$(uuidgen | cut -c1-6 | tr [:upper:] [:lower:])" # TODO for ubuntu, use uuid-runtime 
            echo "==> Test quickstart creation with project name: $uuid"
            pyresttest https://forge.api.openshift.io API_forge_quickstart_wizard.yaml --vars="{'token': '$2', 'userid': '$1', 'space_name_var': 'WIZARD', 'repo_name': '$uuid'}" #--interactive true --print-headers true
        else
            echo "==> Username doesn't belong to any github organisation: $hasGitOrganisation"
            uuid="quickstart$(uuidgen | cut -c1-6 | tr [:upper:] [:lower:])" # TODO for ubuntu, use uuid-runtime 
            echo "==> Test quickstart creation with project name: $uuid"
            pyresttest https://forge.api.openshift.io API_forge_quickstart_no_gh_organisation.yaml --vars="{'token': '$2', 'userid': '$1', 'space_name_var': 'WIZARD', 'repo_name': '$uuid'}" #--interactive true --print-headers true
       fi
    fi
fi

# Tear down: delete generated GH repos (when github organisation and github token are provided)
if [ -n "$3" ] 
then 
    echo "==> 4. tear down: delete github $3/$uuid repo with GitHub token $4"
    curl -X DELETE -H "Authorization: token $4" "https://api.github.com/repos/$3/$uuid"
fi