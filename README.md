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

