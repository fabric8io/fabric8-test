# Openshift.io User Scenario Performance Evaluation
These tests are intended to measure performance of OSIO UI for users performing a given scenario such as login, click through the OSIO UI etc.

## Environment
The tested server is the OSIO [Auth Services deployed in prod-preview](https://auth.prod-preview.openshift.io/api/status).
The clients to the tested server are deployed on the client nodes 
of the [OsioPerf Lab](https://github.com/fabric8-services/fabric8-auth-tests/blob/master/performance/README.md).

## Test setup
The test in the environment is executed with 10 tested OSIO user accounts that has a GitHub account linked.
The user accounts are evenly spread between 10 individual client nodes of the OsioPerf Lab
from whose the requests are sent via 100 simultaneous clients (=simulated users). Each simulated user waits randomly between 1 to 10 seconds
before sending another request.

## Scenarios

### Auth Login
#### *Open login page* (`open-login-page-time`)
From `GET /api/login?redirect=http://localhost:8090/link.html` wait for the `LOG IN` button to be clickable
which indicates that the page is loaded.

#### *Login the user* (`login-time`)
From clicking on the `LOG IN` button wait for the redirect to the `http://localhost:8090/link.html?token_json=<JSON>`.

From the redirect URL extract the `<JSON>` part and from in the `auth_token` and `refresh_token`.

Run `auth-api-user` scenario once to get the user’s info and extract the `username` and `user ID`.

### OAuth2 Friendly Login
#### *Open login page* (`oauth2-open-login-page-time`)
From 
```
GET /api/authorize?response_type=code&client_id=740650a2-9c44-4db5-b067-a3d1b2cd2d01&scope=user:email&state=<STATE>&redirect_uri=https://<AUTH_SERVER_HOST>/api/status
```
where `state` is generated unique UUID v4 wait for the `LOG IN` button to be clickable which indicates that the page is loaded. (in `/login` it is upto us to generate `state`, thus we use uuid, but in `/authorize` state is generated and sent by client, we don't have a restriction on that. `state` sent by client could be any string, but since state is supposed to be random enough and unique, uuid would be a good choice. But it is upto client to use it or not)

#### *Get code* (`oauth2-get-code-time`)
From clicking on the `LOG IN` button wait to be redirected to the `https://<AUTH_SERVER_HOST>/api/status?code=<CODE>&state=<STATE>`.

Check that the returned `<STATE>` is equal to the original and extract `<CODE>` from the URI.

#### *Get token* (`oauth2-get-token-time`)
Using HTTP client send:
```
POST /api/token
Content-Type: application/x-www-form-urlencoded
	
grant_type=authorization_code&client_id=740650a2-9c44-4db5-b067-a3d1b2cd2d01&code=<CODE>&redirect_uri=https://<AUTH_SERVER_HOST>/api/status
```

From the response JSON extract the `auth_token` and `refresh_token`.

#### *Login the user* (`oauth2-login-time`)
This is computed as a sum of `oauth2-get-code-time` and `oauth2-get-token-time` values.

## How to run the tests locally
By default the load test executed by Locust tool runs in a distributed mode, i.e. uses remote access
to the Master and Slave nodes via SSH to start Locust process on those nodes to load the tested system
from a different places.

However, it is possible to switch the test to the local execution. To do that simply set the environment
variable `RUN_LOCALLY=true`. The easiest way is to uncomment the respective line in `_setenv.sh` file.

To run the test, configure the test in `_setenv.sh` file and run the `run.sh` script.
