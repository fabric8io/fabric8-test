# $1 = github token
# $2 = github username
set -x

REPOS=`curl -X  GET https://api.github.com/users/$2/repos -H "Authorization: token $1" | grep \"name\" | sed 's/\"name\": \"//g' | sed s'/ //g' | sed s'/",//g' | grep -v vertxbasic | grep -v ApacheLicense2.0`

for repo in $REPOS; do echo "deleting repo " $repo ; curl -X DELETE -H "Authorization: token $1" https://api.github.com/repos/$2/$repo; done

for repo in $REPOS; do echo "deleting repo " $repo ; done





