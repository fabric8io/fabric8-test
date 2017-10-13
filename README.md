Fabric8-Test 
============

Functional tests for OSiO (OpenShift.io) platform.

# Installation

## End to end test on OSiO

* Build and install

Before running the tests, you must define these ALL env variables as the are needed by the local_run_EE_tests.sh script:
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
And then execute these build/run commands:
```
cd ee_tests
npm install
npm install webdriver-manager
webdriver-manager update
webdriver-manager update --versions.chrome 2.29

.sh ./local_run_EE_tests.sh 
```

> Note: Note that since the test scripts are primarily run on Centocs CI, they assume/require that a copy of the OpenShift client (oc) is installed in the tests' local directory. 

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

## API tests on OSiO

Our API tests use [pyresttest](https://github.com/svanoort/pyresttest.git) a pyton test framework that make all your API test declarative. No need to learn python, your test are plain old yaml file!

### Pre-requisite

* Install Python pip

```
sudo python get-pip.py
```

* Install pyresttest (>=1.7.1)

```
git clone https://github.com/svanoort/pyresttest.git
cd pyresttest
sudo python setup.py install
```

* Install pyresttest dependencies

```
cd EE_API_automation/pyresttest/setup
pip install -U -r requirements.txt
```

### Run API test against PROD

#### WIT API

* To run create space script:

```
cd EE_API_automation/pyresttest/
pyresttest https://api.openshift.io get_a_space.yaml --vars="{'token': 'YOUR_OSIO_TOKEN', 'userid': 'YOUR_OSIO_ACCOUNT', 'space_name_var': 'spacename'}"
```
where YOUR_OSIO_ACCOUNT is your [OSiO account]() and YOUR_OSIO_TOKEN can be either taken form your browser devtools searching localStorage for `auth_token` key or going to your profile page -> `update profile` -> `Advanced` -> `Personal Access Token` copy button. 

#### Forge API

The forge API target [Forge REST backend]() using [Forge addon logic]().
As a pre-requisites, Forge API still need to create a space in WIT API.
The is 2 main flow tested:

* To run import wizard flow:

```
cd EE_API_automation/pyresttest/
./run_forge_import_api_test.sh YOUR_OSIO_ACOUNT YOUR_OSIO_TOKEN
```

> NOTE: Depending wether your github account belongto an organisation or not the API response is different. the bash script wraps the differentce and run the relevant tests.

* To run import wizard flow:

```
cd EE_API_automation/pyresttest/
./run_forge_quickstart_api_test.sh YOUR_OSIO_ACOUNT YOUR_OSIO_TOKEN [GITHUB_ACCOUNT] [GITHUB_TOKEN_WITH_DELETE_SCOPE]
```

> NOTE: [GITHUB_ACCOUNT] and [GITHUB_TOKEN_WITH_DELETE_SCOPE] are optionals. If not provided your guthub account will keep the nely cretaed repository. This repository is prefixed with a UUID.
