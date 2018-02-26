# Openshift.io - Workshop Demo User Scenario Performance Evaluation
These tests are intended to measure performance of OSIO UI for users performing a given scenario such as login, click through the OSIO UI etc.

## Environment
The tested server is the OSIO [Auth Services deployed in prod-preview](https://auth.prod-preview.openshift.io/api/status).
The clients to the tested server are deployed on the client nodes 
of the OsioPerf Lab.

## Test setup
The test in the environment is executed with 10 tested OSIO user accounts that has a GitHub account linked.
The user accounts are evenly spread between 10 individual client nodes of the OsioPerf Lab
from whose the requests are sent via 100s simultaneous clients (=simulated users). Each simulated user waits 1 second
before starting another iteration.

## Scenarios
```
TODO: describe the sceario in steps.
```

## How to run the tests locally
By default the load test executed by Locust tool runs in a distributed mode, i.e. uses remote access
to the Master and Slave nodes via SSH to start Locust process on those nodes to load the tested system
from a different places.

However, it is possible to switch the test to the local execution. To do that simply set the environment
variable `RUN_LOCALLY=true`. The easiest way is to uncomment the respective line in `_setenv.sh` file.

To run the test, configure the test in `_setenv.sh` file and run the `run.sh` script.
