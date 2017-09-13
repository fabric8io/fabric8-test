# $1 = github token

set -x

REPOS=`curl -X  GET https://api.github.com/users/osiotestmachine/repos -H "Authorization: token $1" | grep \"name\" | sed 's/\"name\": \"//g' | sed s'/ //g' | sed s'/",//g' | grep -v vertxbasic`

for repo in $REPOS; do echo "deleting repo " $repo ; curl -X DELETE -H "Authorization: token $1" https://api.github.com/repos/osiotestmachine/$repo; done

for repo in $REPOS; do echo "deleting repo " $repo ; done





