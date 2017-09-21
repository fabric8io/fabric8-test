Fabric8-Test 
============

Functional tests for OSiO (OpenShift.io) platform.

## Installation

### End to end test on OSiO

* Build and install

```
cd ee_tests
npm install
npm install webdriver-manager
webdriver-manager update
webdriver-manager update --versions.chrome 2.29

.sh ./local_run_EE_tests.sh USERNAME PASSWORD https://openshift.io testSuiteName 
```

> Note: for macOS users, make sure you installed `nc` with `brew install netcat` prior launching the script.

* Run on prod

```
.sh ./local_run_EE_tests.sh USERNAME PASSWORD https://openshift.io testSuiteName
```
where USERNAME and PASSWORD should be replaced by your OSiO credentials. Test suite names are defined in protractorEE.config.js - default is "runTest"


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


