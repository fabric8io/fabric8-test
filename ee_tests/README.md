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