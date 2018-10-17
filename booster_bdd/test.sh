#! /bin/bash

set -x 

echo "Create temp dir"
mkdir tempDir

echo "cd to temp dir"
cd tempDir

echo "clone the github repo"
git clone git@github.com:ldimaggi/$1.git

echo "cd to the cloned github repo"
cd $2

echo "create the effective pom"
mvn help:effective-pom -Doutput=effective-pom.xml

echo "copy the effective pom over pom.xml"
cp effective-pom.xml pom.xml 

echo "commit the effective-pom to the master branch"
git commit -a -m "add effective pom"

echo "push the updates to master"
git push -f

echo "cd back to the starting dir"
cd ..



