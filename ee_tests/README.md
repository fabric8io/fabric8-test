# End-to-End Test Repository

## Goal of this Repository

The goal of this repository is to provide automated end-to-end (E2E) tests for production
and stage environment of OpenShift.io.

To see the latest tests results in the CI visit our Wiki page: https://github.com/fabric8io/fabric8-test/wiki

The default test suite is called `smoketest` which serves as a monitoring of the product.
It is expected to run relatively fast therefore this suite will *NOT* test multiple boosters,
multiple pipeline types, advanced interactions with Che etc., this should be done
by unit, functional or integration tests of particular components.

### Smoketest Suite ###

The `smoketest` suite tests *basic* functionality of *all* OpenShift.io components

1. logs into the platform
2. creates a new space
3. creates a new project
4. opens Che workspace
5. verifies that pipeline behaves correctly
6. verifies deployed application in stage and run environments
7. verifies data on the dashboard page and analytics report
8. if beta feature level is enabled, a new workitem is created and verified that it appears on the dashboard

### Other Suites ###
The `che` suite tests more advanced scenario where the user opens Che, updates codebase and the Openshift.io
picks up the changes and runs the build number 2.

The `logintest` is the simplest test where user only logs in and logs out. It runs pretty frequently on Jenkins on all clusters. 

### Running the Tests Locally ###
#### Setup the Environmental Variables ####

Before running the tests, you have to install Node.js and NPM and define environment variables. These are stored in file `config/local_osio.conf.sh`. You need to create the file by yourself by copying its template and filling in the values.

```
cp config/local_osio.conf.sh.template config/local_osio.conf.sh
```

NOTE: To run the booster tests, in local_osio.conf.sh, define the TEST_SUITE as "boostersuite"

#### Install all Dependencies ####
```
npm install
```
#### Run the Tests ####
```
npm start
```
#### Review the test results ####
You can find a lot of screenshots and useful logs in `target/screenshots` directory. Screenshots are 
numbered according to order they have been taken so that you can follow all important test steps. Except
for screenshots also browser logs, network logs and page source are stored. 
### Running the Tests Locally from Docker Image ###
#### Setup the Environmental Variables ####
Setup environmental variables in the same way as when running tests locally (without Docker)
#### Build the Docker Image ####
```
npm run image:build
```
#### Run the Tests Inside Docker Image ####
```
npm run image:start
```
#### Review the test results ####
All artifacts are copied from docker container to `target/screenshots` direcotry. See detailed description 
of artifacts in _Running the Tests Locally/Review the test results_ section.
### Running the Tests Locally against static html page stored on filesystem ###
During the test development, it is sometimes convenient to run some subset of test against locally stored static html page. This is especially useful during debugging of css selectors.

#### Implement Tests ####
Copy template `src/local/local.template.ts` to the same directory `src/local` and
implement the test.

#### Run the Tests Locally ####
```
npm start local
```

