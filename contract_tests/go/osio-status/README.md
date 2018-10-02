# PoC of Contract testing of OpenShift.io status service (`http://openshift.io/api/status` endpoint) in Go

## Requirements

* Install [go lang](https://golang.org/doc/install)
* Follow the [installation steps to prepare](https://github.com/pact-foundation/pact-go#installation) to install `pact-go` package.

## Configuration

The configuration is done via the `./config/config.sh` file:

 * `PACT_CONSUMER` = A name of the consumer in the contract.
 * `PACT_PROVIDER` = A name of the provider in the contract.
 * `PACT_VERSION` = A contract version.
 * `PACT_BROKER_URL` = A Pact broker to store and share pact files.
 * `PACT_PROVIDER_BASE_URL` = A provider base url (default `https://openshift.io`)


## Generate a pact file

The following command runs a consumer test to generate a pact file:

```bash
./test-consumer.sh
```

## Verify a provider using a contract stored in a pact file

The following command verifies the given provider (specified by `PACT_PROVIDER_BASE_URL`) from the pact file generated in the previous step:

```bash
PACT_PROVIDER_BASE_URL="..." ./verify-provider-from-file.sh
```

## Use a Pact broker

### Publish a pact file to a Pact broker

The following command publishes the generated pact file to a Pact broker at a specified URL:

```bash
PACT_BROKER_URL="..." ./publish-contract.sh
```

### Verify a provider using a contract stored in a Pact broker

The follosing command verifies the provider (specified by `PACT_PROVIDER_BASE_URL`) using a pact file taken from a specified Pact broker:

```bash
PACT_BROKER_URL="..." PACT_PROVIDER_BASE_URL="..." ./verify-provider.sh
```