# fabric8-ui Automated Test Repository

## Goal of this Repository

The goal of this repository is to provide automated End-to-End (EE) tests that can be easily
installed and run. All the tests in this repository are configured to be run
locally in a shell, locally in a docker container, and in a docker container in
Centos CI. The tests can be run against a local or remote server by specifying
the server's URL as a parameter to the tests.

### Running the EE Tests Locally ###
#### Setup the Environmental Variables ####

Before running the tests, you must define env variables. These are stored in file config/local_osio.conf.sh. You need to create the file by yourself by copying its template and filling in the values.
```
cp config/local_osio.conf.sh.template config/local_osio.conf.sh
```
#### Install all dependencies ####
```
npm install
```
#### Run the tests ####
```
npm start
```
### Running the EE Tests Locally from Docker Image ###
#### Setup the Environmental Variables ####
Setup environmental vairables in the same way as when running tests locally (without Docker)
#### Install all dependencies ####
```
npm install
```
#### Build the Docker Image ####
```
npm run image:build
```
#### Run Tests Inside Docker Image ####
```
npm run image:start
```




## The rest of the documentation should be reviewed



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

By default, Google Chrome browser is used by EE tests via Selenium. If you want
to use different browser (Firefox for example), set up the following environment
variable before you start script mentioned above:

```
SELENIUM_BROWSER=firefox
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


