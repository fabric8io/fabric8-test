# fabric8-ui Automated Test Repository

## Goal of this Repository

The goal of this repository is to provide automated tests that can be easily
installed and run. All the tests in this repository are configured to be run
locally in a shell, locally in a docker container, and in a docker container in
Centos CI. The tests can be run against a local or remove server by specifying
the server's URL as a parameter to the tests.

Note: The tests are being migrated from JavaScript to TypeScript (December 2017). The JavaScript tests will be maintained, but not extended. New tests will only be written in TypeScript.

### JavaScript End-to-End (EE) tests

The EE tests simulate a user's actions by creating spaces and projects in the
UI. The tests are implemented to run either in a docker container (either
locally or in a CI/CO system), or locally from a shell.

This README includes detailed instructions on how to run the EE tests. If you're
in a hurry, please read the following (2) sections as they contain all the 
instructions you need to run the tests in about 5 minutes.

#### 5-Minute Guide to Running the EE Tests Locally ####

Before running the tests, you must define these env variables as the are needed by the local_run_EE_tests.sh script:

```
OSIO_USERNAME
OSIO_PASSWORD
OSIO_URL
OSO_TOKEN
OSIO_REFRESH_TOKEN
OSO_USERNAME
GITHUB_USERNAME
TEST_SUITE
```

For example:

```
export OSIO_USERNAME="your OSIO user"
export OSIO_PASSWORD="your OSIO password"
export OSIO_URL="https://openshift.io"
export OSO_TOKEN="your OSO token"
export OSIO_REFRESH_TOKEN="your OSIO/KC refresh token"
export OSO_USERNAME="your oso username"
export GITHUB_USERNAME="your github username"
export TEST_SUITE="runTest"
```

After you define these env variables, execute these commands:

```
git@github.com:fabric8io/fabric8-test.git
cd ee_tests
npm install
npm install webdriver-manager
webdriver-manager update
webdriver-manager update --versions.chrome 2.33

.sh ./local_run_EE_tests.sh 
```

If you want to run the EE tests in docker, just execute this command:

```
local_cico_run_EE_tests.sh

```

Note: Note that since the test scripts are primarily run on Centocs CI, they assume/require that a copy of the OpenShift client (oc) is installed in the tests' local directory.


### Detailed Notes on Running tests ####

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

### Typescript EE Tests ###

### setup ###

```
npm install -g yarn
yarn

```
### run the tests ###

After setting the environment variables defined above, run using the `npm start` helper which runs `ts-protractor.sh` script

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


## Running the E2E tests inside a pod

You can run the E2E tests on a running fabric8 cluster using the [gofabric8](https://github.com/fabric8io/gofabric8/releases) CLI tool.

First you need to add a `Secret` for a username/password you wish to use to test your cluster. If you've not created one yet you can do that via the CLI:

```
gofabric8 e2e-secret --user=MYUSER --password=MYPWD --secret=MYNAME
```

This command will generate a secret called `MYNAME` using your username/password values of `MYUSER/MYPWD`

Now that there is a `Secret` defined in your current namespace you can run the E2E tests using this secret via:

```
gofabric8 e2e
```

if you have your own fork of this repository you can refer to your own fork and a branch of the tests via something like this:

```
gofabric8 e2e --repo https://github.com/jstrachan/fabric8-test.git --branch new-script
```

### Arguments

You can specify a number of different CLI arguments to parameterize the E2E tests to configure things like custom Tenant YAMLs to test (e.g. PRs against the YAMLs) or custom boosters.

To see a list of all the current options type:

```
gofabric8 help e2e
```

For each argument name `foo` you pass the argument using `--foo=value` or `--foo value` like the above examples for passing in `repo` and `branch` arguments.

#### Cluster

* `url` : the URL of the remote fabric8 console. If not specified it uses the URL of the current `fabric8` service in the current namespace (or the specified `namespace` argument)
* `platform` : the kind of platform to test. e.g. `osio`, `fabric8-openshift` or `fabric8-kubernetes`. Typically you can ignore this argument as gofabric8 will deadfult this for you

#### Custom boosters

*  `booster` : the name of the booster (quickstart) to use in the tests
*  `booster-git-ref` : the booster git repository reference (branch, tag, sha)
*  `booster-git-repo` : the booster git repository URL to use for the tests - when using a fork or custom catalog"

e.g. to test a custom booster in your own fork try:

```
gofabric8 e2e --booster="My Booster" --booster-git-ref=mybranch --booster-git-repo=https://github.com/myuser/booster-catalog.git
```


#### Custom Tenant YAML

*  `che-version` : the Che YAML version for the tenant
*  `jenkins-version` : the Jenkins YAML version for the tenant
*  `team-version` : the Team YAML version for the tenant
*  `maven-repo` : the maven repository used for tenant YAML if using a PR or custom build

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

iThe full set of outstanding tasks for the EE tests are tracked here: https://openshift.io/openshiftio/openshiftio/plan?label=EE_test

 

