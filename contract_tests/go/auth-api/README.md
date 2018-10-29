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



