# fabric8-ui Automated Test Repository

## Goal of this Repository

The goal of this repository is to provide automated tests that can be easily
installed and run. All the tests in this repository are configured to be run
locally in a shell, locally in a docker container, and in a docker container in
Centos CI. The tests can be run against a local or remove server by specifying
the server's URL as a parameter to the tests.

### Planner UI Tests (tbd)

### Performance/Throughput Tests (tbd)

### End-to-End (EE) tests


The EE tests simulate a user's actions by creating spaces and projects in the
UI. The tests are implemented to run either in a docker container (either
locally or in a CI/CO system), or locally from a shell.

#### Run tests locally ####

Scripts that include the string "local" in their filename are used to run
the tests locally.

#### CI/CI tests ####

Scripts that include the string "cico" in their names are used to run the tests
in a CI/CO system. These scripts do not pass the required test account username
and password as parameters as we do not want to expose this information in
cleantest. The username and password for tests running in CI/CO must be handled
as Jenkins secrets.

### Running tests ####

Before running the tests, you must define these ALL env variables as the are
needed by the local_run_EE_tests.sh script: e.g see `config/local_osio.conf.sh`

`local_run_EE_tests.sh` read the test config from `config/local_osio.conf.sh`
The test config file used by the script can be set by setting the env var
`TEST_CONFIG_FILE` e.g. see `local_run_EE_fabric8_test.sh` that loads different
config file

```
# openshift.io credentials
OSIO_USERNAME
OSIO_PASSWORD
OSIO_URL
OSIO_REFRESH_TOKEN

# Openshift Origin credentials
OSO_TOKEN
OSO_USERNAME

# Github
GITHUB_USERNAME
TEST_SUITE
```

To run the tests locally, execute these commands:

```
cd ee_tests
# using yarn as package manager instead of npm

npm install -g yarn
yarn

./local_run_EE_tests.sh
```

> Note: Note that since the test scripts are primarily run on Centocs CI, they
> assume/require that a copy of the OpenShift client (oc) is installed int he
> tests' local directory.

By default, Google Chrome browser is used by EE tests via Selenium. If you want
to use different browser (Firefox for example), set up the following environment
variable before you start script mentioned above:

```
SELENIUM_BROWSER=firefox
```

### Typescript specs ###

### setup ###

```
npm install -g yarn
yarn

```
### run the tests ###

Run using the `npm start` helper which runs `ts-protractor.sh` script

```
npm start
```

#### tips and tricks ####

##### debugging #####

You can use chrome devtools to pause and debug typescript tests by inserting
the `debugger` statement in the spec and running the test with `NODE_DEBUG`
environment flag set. E.g.

```
NODE_DEBUG=true npm start
```

##### Turn debug statements on #####

```
DEBUG=true npm start
```


### End-to-End tests on Fabric8

To run against a fabric8 installation (e.g. via minishift) run the following command:


```
./local_run_EE_fabric8_test.sh
```

### Running the E2E Tests in Intellij IDEA

You can run the E2E tests directly in IDEA which makes it super easy to link
from failures to protractor test code when there are failures or to set
breakpoints and to debug the tests.

There is some background on [running protractor in IDEA here](https://www.jetbrains.com/help/idea/run-debug-configuration-protractor.html).

Basically try this:

```
cd ee_tests
npm install -g yarn
yarn
npm run webdriver:update
npm run webdriver:start 2>&1 | tee webdriver.log
```

Then in IDEA:

* click the `Run -> Edit Configurations...` button in IDEA
* select the `+` to add a new runtime configuration and select `Protractor`
* find the `protractorEE-env.config.js` file as the test suite to run
* define the following environment variables:
  * USERNAME (the username on RHD for https://openshift.io or github for fabric8)
  * PASSWORD (the password for RHD / github like above)
  * TARGET_URL (if you want to point at something other than https://openshift.io/)
  * you may want to define [some of these other environment variables](https://github.com/fabric8io/fabric8-test/blob/master/ee_tests/protractorEE-env.config.js#L17) too
* now just click the Run / Debug button in IDEA!
* if a test fails you should have nice links in the output to source lines - you can also set breakpoints and debug the tests!

### End-to-End Test Coverage


| Test File  | EE Feature Coverage |
| ---------- | ------------------- |
| openshift-io-burr-analytic.spec.js | Basic test for analytical report
| openshift-io-burr-che-quickstart.spec.js | Runs the Vert.x Basic quickstart
| openshift-io-burr-che.spec.js | Creates a Che workspace, runs the Vert.x Basic quickstart
| openshift-io-burr-che-terminal.spec.js | Creates a Che workspace, runs the Vert.x Basic quickstart from the Che terminal window
| openshift-io-burr-import-che.spec.js | Imports a project, creates a Che workspace
| openshift-io-burr-import-pipeline.spec.js | Imports a project, runs the build pipeline
| openshift-io-burr-login.spec.js | Logins and logs out
| openshift-io-burr-new-space.spec.js | Creates a new space
| openshift-io-burr-pipeline.spec.js | Runs the build pipeline
| openshift-io-burr-quickstart.spec.js | Runs the build pipeline for each quickstart
| openshift-io-burr-setup.spec.js | Rseets the user account
| openshift-io-burr-template.spec.js | Template for new tests

TBD tests:
* Edit source files in Che to force rebuild/redeploy
* Verify all defined workflows
* Import, build, run all Obsidian "boosters" as quickstarts
* EE tests for idle Che and Jenkins - https://openshift.io/openshiftio/openshiftio/plan/detail/1709
* Refactor EE tests page object model code into npm module - to enable the code to be shared more easil - https://openshift.io/openshiftio/openshiftio/plan/detail/1702
* Create/configure EE tests to verify operation of different OSIO clusters - https://openshift.io/openshiftio/openshiftio/plan/detail/1695
* Resolve when tests fail to login when openshift.io login name is different than github - https://openshift.io/openshiftio/openshiftio/plan/detail/1642
* Implement mechanism to verify thru the API actions taken in the UI by the EE tests, https://openshift.io/openshiftio/openshiftio/plan/detail/1637
* Extend EE tests to exercise deployed app on stage and run  - https://openshift.io/openshiftio/openshiftio/plan/detail/1634

The full set of outstanding tasks for the EE tests are tracked here: https://openshift.io/openshiftio/openshiftio/plan?label=EE_test


