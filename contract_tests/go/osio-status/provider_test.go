// Package osiostatus contains a runnable Consumer Pact test example.
package osiostatus

import (
	"fmt"
	"os"
	"path/filepath"
	"testing"

	"github.com/pact-foundation/pact-go/dsl"
	"github.com/pact-foundation/pact-go/types"
)

func TestOsioStatusProvider(t *testing.T) {

	var pactDir = os.Getenv("PACT_DIR")
	var pactFile = filepath.ToSlash(fmt.Sprintf("%s/osiostatusconsumer-osiostatusprovider.json", pactDir))
	var pactProviderBaseURL = os.Getenv("PACT_PROVIDER_BASE_URL")

	// Create Pact connecting to local Daemon
	pact := &dsl.Pact{
		Consumer: "OsioStatusConsumer",
		Provider: "OsioStatusProvider",
		PactDir:  pactDir,
		Host:     "localhost",
		LogLevel: "DEBUG",
	}
	defer pact.Teardown()

	var providerSetupHost = "localhost"
	var providerSetupPort = 8080

	go ProviderSetup(providerSetupHost, providerSetupPort, pactProviderBaseURL)

	// Verify the Provider with local Pact Files
	pact.VerifyProvider(t, types.VerifyRequest{
		ProviderBaseURL:        pactProviderBaseURL,
		PactURLs:               []string{pactFile}, // here comes the URL to the Pact Broker
		ProviderStatesSetupURL: fmt.Sprintf("http://%s:%d/pact/setup", providerSetupHost, providerSetupPort),
	})

	fmt.Println("Test Passed!")
}
