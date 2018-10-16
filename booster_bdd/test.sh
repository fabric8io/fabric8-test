#! /bin/bash

mkdir tempDir
cd tempDir
git clone git@github.com:ldimaggi/{$1}.git
cd $1

mvn help:effective-pom -Doutput=effective-pom.xml
cp effective-pom.xml pom.xml 
git add effective-pom.xml
git commit -a -m "add effective pom"
git push -f

cd ..



