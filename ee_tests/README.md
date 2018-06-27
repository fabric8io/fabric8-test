# End-to-End Test Repository

## Goal of this Repository

The goal of this repository is to provide automated end-to-end (E2E) tests for production
and stage environment of OpenShift.io.

The default test suite is called `smoketest` which serves as a monitoring of the product.
It is expected to run relatively fast therefore this suite will *NOT* test multiple boosters,
multiple pipeline types, advanced interactions with Che etc., this should be done
by unit, functional or integration tests of particular components.

### Smoketest Suite ###

The `smoketest` suite is being executed by CentOS CI on prod-preview, on every prod cluster and for both
`beta` and `released` feature levels.

* [Jenkins jobs on prod-preview](https://ci.centos.org/view/Devtools/search/?q=devtools-test-e2e-prod-preview.openshift.io-smoketest)
* [Jenkins jobs on production clusters](https://ci.centos.org/view/Devtools/search/?q=devtools-test-e2e-openshift.io-smoketest)

The `smoketest` suite tests (or will be testing) *basic* functionality of *all* OpenShift.io components, i.e.

1. logs into the platform
2. creates a new space
3. creates a new Vert.x project
4. opens Che workspace
5. verifies that pipeline behaves correctly
6. verifies deployed application in stage and run environments
7. verifies data in deployments page and analytics report

It is expected to be expanded to do something meaningful in Che and to interact with Planner in the future.

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

### Running the Tests Locally against static html page stored on filesystem ###
During the test development, it is sometimes convenient to run some subset of test against locally stored static html page. This is especially useful during debugging of css selectors.

#### Implement Tests ####
Copy template `src/local/local.template.ts` to the same directory `src/local` and
implement the test.

#### Run the Tests Locally ####
```
npm start local
```

##### Debugging #####

You can use chrome devtools to pause and debug typescript tests by inserting
the `debugger` statement in the spec and running the test with `NODE_DEBUG`
environment flag set. E.g.

```
NODE_DEBUG=true npm start
```

##### Turn Debug Statements on #####

```
DEBUG=true npm start
```
