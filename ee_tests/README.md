# fabric8-ui Automated Test Repository

## Goal of this Repository

The goal of this repository is to provide automated End-to-End (EE) tests that can be easily
installed and run. All the tests in this repository are configured to be run
locally in a shell, locally in a docker container, and in a docker container in
Centos CI. The tests can be run against a local or remote server by specifying
the server's URL as a parameter to the tests.

### Running the Tests Locally ###
#### Setup the Environmental Variables ####

Before running the tests, you must define env variables. These are stored in file config/local_osio.conf.sh. You need to create the file by yourself by copying its template and filling in the values.
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

By default, Google Chrome browser is used by EE tests via Selenium. If you want
to use different browser (Firefox for example), set up the following environment
variable before you start script mentioned above:

```
SELENIUM_BROWSER=firefox
```


