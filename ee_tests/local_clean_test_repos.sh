#!/bin/bash

# $1 = GitHub username
# $2 = filter for name of the repository/repositories
# $3 = filter based on time of last update in YYY-MM-DD format, e.g. <2015-05-20

USER=${1:-"osiotestmachine"}
NAME=${2:-"e2e"}
DATE=${3:-"<$(date --date='week ago' +%F)"}

which jq > /dev/null 2>&1
if [[ $? != 0 ]]; then
  echo "Please install 'jq' utility"
  echo "Fedora: sudo dnf install -y jq"
  echo "Ubuntu: sudo apt-get install -y jq"
  exit 1
fi

RESPONSE=$(curl -s -X  GET \
  "https://api.github.com/search/repositories?q=$NAME+user:$USER+in:name+pushed:$DATE&sort=updated&order=asc" \
  -H "Authorization: token $GITHUB_TOKEN" )

echo "Total count of repositories: $(echo $RESPONSE | jq '.total_count')"

REPOS=$(echo "$RESPONSE" | jq -r '.items[].name')

if [[ -z $REPOS ]]; then
  echo "There are no GitHub repositories matching the filter"
  exit 0
fi

echo "************************** WARNING WARNING WARNING *********************************** "
echo "This script will delete these $(echo $RESPONSE | jq '.items | length') repositories"
echo "************************************************************************************** "
for REPO in $REPOS; do echo "$REPO"; done
echo "*************************************************************************************** "
echo " "

read -r -n 1 -p "Are you sure? (Yy|Nn)" REPLY
# move to a new line
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
  for REPO in $REPOS; do
    echo "deleting repo $REPO"
    curl -X DELETE -H "Authorization: token $GITHUB_TOKEN" "https://api.github.com/repos/$USER/$REPO"
  done
fi
