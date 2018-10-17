#! /bin/bash

# Shell script to create/update to master effective pom

set +x

echo "Create temp dir"
mkdir tempDir

echo "cd to temp dir"
cd tempDir

echo "clone the github repo"
git clone $1

echo "cd to the cloned github repo"
cd $2

echo "show the dir name"
pwd

echo "show the dir contents"
ls -l

echo "rename original pom.xml"
mv pom.xml epom.xml

echo "create the effective pom"
mvn help:effective-pom -f epom.xml -Doutput=pom.xml

echo "set the git username and password"
git config --global user.name $3
git config --global user.password $4

echo "commit the effective-pom to the master branch"
git commit -a -m "add effective pom" 

echo "push the updates to master"
git push -f      

echo "cd back to the starting dir"
cd ../..


