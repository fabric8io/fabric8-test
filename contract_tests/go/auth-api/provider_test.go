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

// TestAuthAPIProvider verifies the provider
func TestAuthAPIProvider(t *testing.T) {

	var pactDir = os.Getenv("PACT_DIR")
	//var pactFile = filepath.ToSlash(fmt.Sprintf("%s/osiostatusconsumer-osiostatusprovider.json", pactDir))
	var pactProviderBaseURL = os.Getenv("PACT_PROVIDER_BASE_URL")

	var pactConsumer = os.Getenv("PACT_CONSUMER")
	var pactProvider = os.Getenv("PACT_PROVIDER")

	var userName = os.Getenv("OSIO_USERNAME")
	var userID = os.Getenv("OSIO_USER_ID")

	// Create Pact connecting to local Daemon
	pact := &dsl.Pact{
		Consumer: pactConsumer,
		Provider: pactProvider,
		PactDir:  pactDir,
		Host:     "localhost",
		LogLevel: "INFO",
	}
	defer pact.Teardown()

	var providerSetupHost = "localhost" // this should ultimately be part of the provider api (developer mode: on)
	var providerSetupPort = 8080

	go ProviderSetup(providerSetupHost, providerSetupPort, pactProviderBaseURL, userName, userID)

	// Verify the Provider with local Pact Files
	pact.VerifyProvider(t, types.VerifyRequest{
		ProviderBaseURL: pactProviderBaseURL,
		// BrokerURL:              os.Getenv("PACT_BROKER_URL"),
		// BrokerUsername:         os.Getenv("PACT_BROKER_USERNAME"),
		// BrokerPassword:         os.Getenv("PACT_BROKER_PASSWORD"),
		PactURLs:               []string{fmt.Sprintf("%s/%s-%s.json", pactDir, strings.ToLower(pactConsumer), strings.ToLower(pactProvider))},
		ProviderStatesSetupURL: fmt.Sprintf("http://%s:%d/pact/setup", providerSetupHost, providerSetupPort),
	})

	fmt.Println("Test Passed!")
}
