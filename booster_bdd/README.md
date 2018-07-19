# BDD tests for the OSIO boosters

These tests are intended to provide end-to-end test coverage to support the contribution of new boosters and changes to existing boosters. The tests are implemented in Python, are built with the Behave (https://github.com/behave/behave) test framework, and follow the Behavior Driven Development (BDD) model.

DANGER-ZONE: Running these tests will by default reset your OpenShift.io user environment. This will result in your spaces, projects, etc. being deleted in OpenShift.io - To avoid resetting your user environment, comment out any entries in the test scenario definition files that reference "reset." The test scenario files are contained in the "test-scenario" directory.

## Pre-requisities

### Install a browser and a WebDriver

```bash
yum install chromium chromium-headless chromedriver
```

### For Macintosh users

Install chromedriver from:  https://sites.google.com/a/chromium.org/chromedriver/downloads

Unzip the chromedriver contents and add it to the PATH “export PATH=$PATH:<path/to/chromedriver-executable>” 

### Install python 3.3+

### (Optional) Install Allure framework

This is needed for viewing of the HTML report of the tests' results.

1. Download Allure from the [websites](https://bintray.com/qameta/generic/allure2).
1. Unzip to archive into a local directory `$ALLURE_HOME`
1. Add `$ALLURE_HOME` to the `$PATH`:

```bash
export PATH=$PATH:$ALLURE_HOME/bin
```

### Configure Environmental Variables

If a new booster is being tested, the test configuration must reference an existing github repo. The default name configured for a new booster to be imported is "test123". This default name, along with other booster configuration/environmental variables is configurable in the configuration scripts contained in the "config" directory:

The full set of configuration/environmental variables used by these tests are:

* Test scenario: SCENARIO
* URI of OpenShift.io: SERVER_ADDRESS
* URI of the Openshift.io forge server: FORGE_API
* URI of the Openshift.io API server: WIT_API
* URI of the Openshift.io Auth server: AUTH_API
* OpenShift Online Cluster URL: OSO_CLUSTER_ADDRESS
* Openshift.io username: OSIO_USERNAME
* OpenShift.io password: OSIO_PASSWORD
* OpenShift.io booster mission: BOOSTER_MISSION
* OpenShift.io booster runtime: BOOSTER_RUNTIME
* Boolean to specify blank booster true|false: BLANK_BOOSTER
* OpenShift.io pipeline release strategy: PIPELINE
* github repo name: GIT_REPO
* OpenShift.io project name: PROJECT_NAME
* Default client_id for the OAuth2 protocol used for user login: AUTH_CLIENT_ID
* Output directory where the reports will be stored: REPORT_DIR
* Boolean to specify if the UI dependend parts of the test suite are to be run in headless mode: UI_HEADLESS

## Run the all the tests locally

Set environmental variables for `OSO_CLUSTER_ADDRESS`, `OSIO_USERNAME` and `OSIO_PASSWORD` or update the `config/config.sh` file and run the `run.sh`.

Example:

```bash
OSO_CLUSTER_ADDRESS='https://api.starter-us-east-2a.openshift.com:443' OSIO_USERNAME=... OSIO_PASSWORD=... ./run.sh
```

It is also possible to use an alternative configuration file (e.g. `config/prod-preview.sh`):

```bash
./run.sh prod-preview
```

The test will run and save the results under `$REPORT_DIR` directory(default name is `./test_output`).

### Run a single test locally

Set additional environmental variable for `SCENARIO` or update the `config/config.sh` file and run the `run.sh`.

Example:

```bash
SCENARIO='import-repo' OSO_CLUSTER_ADDRESS='https://api.starter-us-east-2a.openshift.com:443' OSIO_USERNAME=... OSIO_PASSWORD=... ./run.sh
```

## View Allure report

```bash
allure serve $REPORT_DIR
```

It will start a tiny local web server with the report.

## :warning: Generate Allure HTML report

It is possible to generate an HTML report by:

```bash
allure generate $REPORT_DIR -c -o allure-report
```

However, openning the report in Chrome is blocked by a security feature of the Chrome browser that prevents cross-origin requests to the local file system. That results in the following error:

```txt
Failed to load file:///.../allure-report/widgets/summary.json: Cross origin requests are only supported for protocol schemes: http, data, chrome, chrome-extension, https.
```

So it's better to use the above `allure serve`.
