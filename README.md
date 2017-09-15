Fabric8-Test 
============

Functional tests for OSiO (OpenShift.io) platform.

## Installation

### End to end test on OSiO

* Build and install

```
cd ee_tests
npm install
.sh ./local_run_EE_tests.sh USERNAME PASSWORD https://openshift.io
```

> Note: for macOS users, make sure you installed `nc` with `brew install netcat` prior launching the script.

* Run on prod

```
.sh ./local_run_EE_tests.sh USERNAME PASSWORD https://openshift.io
```
where USERNAME and PASSWORD should be replaced by your OSiO credentials.


## Running the E2E tests inside a pod

You can run the E2E tests on a running fabric8 cluster using the [gofabric8](https://github.com/fabric8io/gofabric8/releases) CLI tool.

First you need to add a `Secret` for a username/password you wish to use on your cluster. If you've not created one yet you can do that via the CLI:

```
gofabric8 e2e-secret --user=MYUSER --password=MYPWD --secret=MYNAME
```

The above defaults to testing on a fabric8 cluster on openshift. If you want to test on a kubernetes based cluster like GKE then add the ` --platform=fabric8-kubernetes` argument:

```
gofabric8 e2e-secret --user=MYUSER --password=MYPWD --secret=MYNAME --platform=fabric8-kubernetes 
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

