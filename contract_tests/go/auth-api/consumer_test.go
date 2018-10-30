// Package main contains a runnable Consumer Pact test example.
package main

import (
	"fmt"
	"os"
	"strings"
	"testing"

	"github.com/pact-foundation/pact-go/dsl"
	"github.com/pact-foundation/pact-go/types"
)

// TestAuthAPIConsumer runs all user related tests
func TestAuthAPIConsumer(t *testing.T) {

	var pactDir = os.Getenv("PACT_DIR")
	var pactConsumer = os.Getenv("PACT_CONSUMER")
	var pactProvider = os.Getenv("PACT_PROVIDER")
	var pactVersion = os.Getenv("PACT_VERSION")

	var pactBrokerURL = os.Getenv("PACT_BROKER_URL")
	var pactBrokerUsername = os.Getenv("PACT_BROKER_USERNAME")
	var pactBrokerPassword = os.Getenv("PACT_BROKER_PASSWORD")

	// Create Pact connecting to local Daemon
	pact := &dsl.Pact{
		Consumer:          pactConsumer,
		Provider:          pactProvider,
		PactDir:           pactDir,
		Host:              "localhost",
		LogLevel:          "INFO",
		PactFileWriteMode: "overwrite",
	}
	defer pact.Teardown()

	// Test interactions
	AuthAPIStatus(t, pact)
	AuthAPIUserByNameConsumer(t, pact)
	AuthAPIUserByIDConsumer(t, pact)
	AuthAPIUserByToken(t, pact)

	// Negative tests
	AuthAPIUserInvalidToken(t, pact)
	AuthAPIUserNoToken(t, pact)

	fmt.Printf("All tests done, writting a pact to %s directory.\n", pactDir)
	pact.WritePact()

	fmt.Printf("Publishing pact to a broker %s\n", pactBrokerURL)

	p := dsl.Publisher{}
	err := p.Publish(types.PublishRequest{
		PactURLs:        []string{fmt.Sprintf("%s/%s-%s.json", pactDir, strings.ToLower(pactConsumer), strings.ToLower(pactProvider))},
		PactBroker:      pactBrokerURL,
		BrokerUsername:  pactBrokerUsername,
		BrokerPassword:  pactBrokerPassword,
		ConsumerVersion: pactVersion,
		Tags:            []string{"latest"},
	})

	if err != nil {
		fmt.Printf("Unable to publish pact to a broker %s:\n%q\n", pactBrokerURL, err)
	}
}
