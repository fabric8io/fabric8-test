#!/bin/bash

source ./_setenv.sh

prefix=$1

if [ "$prefix" !=  "" ]; then
	for i in `curl -L --silent -H "Authorization: token $GH_TOKEN" https://api.github.com/users/$GH_USER/repos?sort=created | jq '.[]["name"]' | tr -d '"' | grep "$prefix"`; do
		echo "Deleting repo https://api.github.com/repos/$GH_USER/$i..."
		curl -L --silent -XDELETE -H "Authorization: token $GH_TOKEN" "https://api.github.com/repos/$GH_USER/$i"
	done
else
	echo "Usage: $0 <repo-prefix>"
fi