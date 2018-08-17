# $1 = GitHub token
# $2 = GitHub username
# $3 = filter for name of the repository/repositories

which jq > /dev/null 2>&1
if [[ $? != 0 ]]; then
  echo "Please install 'jq' utility"
  echo "Fedora: sudo dnf install -y jq"
  echo "Ubuntu: sudo apt-get install -y jq"
  exit 1
fi

RESPONSE=$(curl -X  GET "https://api.github.com/users/$2/repos?affiliation=owner&sort=created&direction=desc" -H "Authorization: token $1" )

REPOS=$(echo $RESPONSE | jq '.[] | .name' | sed 's/\"//g' | grep ${3:-test})

if [[ -z $REPOS ]]; then
  echo "There are no GitHub repositories matching the filter"
  exit 2
fi

echo "************************** WARNING WARNING WARNING ************************** "
echo "This script will delete these repositories:"
echo "***************************************************************************** "
for REPO in $REPOS; do echo $REPO; done
echo "***************************************************************************** "
echo " "

read -r -n 1 -p "Are you sure? (Yy|Nn)" REPLY
# move to a new line
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
  for REPO in $REPOS; do
    echo "deleting repo $REPO"; curl -X DELETE -H "Authorization: token $1" https://api.github.com/repos/$2/$REPO;
  done
fi






