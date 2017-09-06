# fabric8-ui Automated Test Repository

## Goal of this Repository

The goal of this repository is to provide automated tests that can be easily installed and run. All the tests in this repository are configured to be run locally in a shell, locally in a docker container, and in a docker container in Centos CI. The tests can be run against a local or remove server by specifying the server's URL as a parameter to the tests.

### Planner UI Tests (tbd)

### Performance/Throughput Tests (tbd)

### End-to-End (EE) tests

The EE tests simulate a user's actions by creating spaces and projects in the UI. The tests are implemented to run either in a docker container (either locally or in a CI/CO system), or locally from a shell. Scripts that include the string "local" in their filename are used to run the tests locally. Scripts that include the string "cico" in their names are used to run the tests in a CI/CO system. These scripts do not pass the required test account username and password as parameters as we do not want to expose this information in cleantest. The username and password for tests runnin gin CI/CO must be handled as Jenkins secrets.

To run the tests locally, execute these commands:

git clone git@github.com:fabric8io/fabric8-test.git
cd ee_tests
npm install

And then invoke this script:

```
sh ./local_run_EE_tests.sh username password http://target-URL-for-your-server
```

For example:

```
sh ./local_run_EE_tests.sh username password https://openshift.io
```

To run the tests locally on docker, run this script:
local_cico_run_EE_tests.sh username password http://target-URL-for-your-server


By default, Google Chrome browser is used by EE tests via Selenium. If you want
to use different browser (Firefox for example), set up the following environment
variable before you start script mentioned above:

```
SELENIUM_BROWSER=firefox
```

### End-to-End tests on Fabric8

To run against a fabric8 installation (e.g. via minishift) run the following command:


```
./local_run_EE_fabric8_test.sh githubUserName githubPassword http://fabric8-fabric8.${minishift ip}.nip.io
```

### Running the E2E Tests in Intellij IDEA

You can run the E2E tests directly in IDEA which makes it super easy to link from failures to protractor test code when there are failures or to set breakpoints and to debug the tests.

There is some background on [running protractor in IDEA here](https://www.jetbrains.com/help/idea/run-debug-configuration-protractor.html).

Basically try this:

```
cd ee_tests
npm install
node_modules/protractor/bin/webdriver-manager  start --versions.chrome 2.29
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
  
 