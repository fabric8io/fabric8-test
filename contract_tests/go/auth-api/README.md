# PoC for Auth Service contract tests using Pact framework

## Requirements

* Install [go lang](https://golang.org/doc/install)
* Follow the [installation steps to prepare](https://github.com/pact-foundation/pact-go#installation) to install `pact-go`
 package.

## Pact broker Credentials

The pact broker is secured by Basic Auth. The best way to provide username and password is following:

* Username: set `PACT_BROKER_USERNAME` environment variable (etiher in `config/config.sh` or in the environment)
* Password: Create a file `.pact-broker-password` and place the password in the file (the whole file content is considered a password).

## Description of the tests

test-consumer.sh:

* Executes TestAuthAPIConsumer, which in turn invokes each of the tests in the package:
  * AuthAPIStatus
  * AuthAPIUserByNameConsumer
  * AuthAPIUserByIDConsumer
  * AuthAPIUserByToken
  * AuthAPIUserInvalidToken
  * AuthAPIUserNoToken
* Each test invocation, creates a pact
* And TestAuthAPIConsumer publishes the pacts to the Pact Broker and writes the pacts to a pact file

test-provider.sh:

* Executes TestAuthAPIProvider, which in turn:
* Executes ProviderSetup 
* Executes pact.VerifyProvider which in turn, executes each of the interactions written to the pact file,
  each interaction corresponds to the pacts created when the tests were invoked by TestAuthAPIConsumer

The provider tests run (against the actual provider) and verify that the (remote/external) provider is in compliance with the pact.

The consumer tests run locally (against the pact mock provider service) and verify that the expected (mocked) interactions are in compliance with the pact.

Changes in the provider code can break the pact. If the provider changes, the pact, and the consumer and provider etsts should be updated simultaneously with the provider code changes. 

When each of the consumer tests run, multiple actions take place:

* A test is defined - for example, in the AuthAPIStatus function, this test is defined - this test will be run against the defined enpoint in the pact-go mock service:

```go
var test = func() error {
    u := fmt.Sprintf("http://localhost:%d/api/status", pact.Server.Port)
    req, err := http.NewRequest("GET", u, nil)

    req.Header.Set("Content-Type", "application/json")
    if err != nil {
        return err
    }

    _, err = http.DefaultClient.Do(req)
    if err != nil {
        return err
    }
    return err
}
```

* The expected interactions, in other words, the results that we expect, are defined in a pact:

```go
pact.
    AddInteraction().
    Given("Auth service is up and running.").
    UponReceiving("A request to get status").
    WithRequest(dsl.Request{
        Method:  "GET",
        Path:    dsl.String("/api/status"),
        Headers: dsl.MapMatcher{"Content-Type": dsl.String("application/json")},
    }).
    WillRespondWith(dsl.Response{
        Status:  200,
        Headers: dsl.MapMatcher{"Content-Type": dsl.String("application/vnd.status+json")},
        Body:    dsl.Match(STATUS{}),
    })
```

* Data structures that are required by the test and pact are defined:

```go
type STATUS struct {
    buildTime           string `json:"buildTime" pact:"example=2018-10-05T10:03:04Z"`
    commit              string `json:"commit" pact:"example=0f9921980549b2baeb43f6f16cbe794f430f498c"`
    configurationStatus string `json:"configurationStatus" pact:"example=OK"`
    databaseStatus      string `json:"databaseStatus" pact:"example=OK"`
    startTime           string `json:"startTime" pact:"example=2018-10-09T15:04:50Z"`
}

```

* The test is run (the pact is verified):

```go
if err := pact.Verify(test); err != nil {
    log.Fatalf("Error on Verify: %v", err)
}

```

## Run the PoC

In one terminal start the local auth service instance (the tested provider) (will run at `http://localhost:8089`)

```shell
./support/start-local-auth.sh
```

> NOTE: It is possible that you encounter `too many open files` error.
>       To solve it, you can increase the limits in your system by running the following.
> ```bash
> sudo echo "* hard nofile 999999" >> /etc/security/limits.conf
> sudo echo "* soft nofile 999999" >> /etc/security/limits.conf
> sudo echo "fs.inotify.max_user_watches=65536" >> /etc/sysctl.conf
> sudo echo "fs.inotify.max_user_instances=2048" >> /etc/sysctl.conf
> ```

In the second terminal start the local Pact broker instance (will run at `http://localhost:8090`)

```shell
./support/start-local-pact-broker.sh
```

Copy `./config/config.sh.example` to `./config/config.sh` and set `OSIO_USERNAME` and `OSIO_PASSWORD` variables in `config/config.sh` file.

Create a Pact broker password file.

```shell
echo -n "changeme!!!" >> .pact-broker-password
```

Run the consumer side - expectations - and record a pact file. The pact file is published to the local Pact broker.

```shell
./test-consumer.sh
```

Run the provider side - verify the contract taken from the local Pact broker against the provider (local auth service).

```shell
./test-provider.sh
```
