package main

import (
	"fmt"
	"log"
	"os"
	"strings"
	"testing"

	"github.com/pact-foundation/pact-go/dsl"
	"github.com/pact-foundation/pact-go/types"
)

// TestAuthAPIConsumer runs all user related tests
func TestAuthAPIConsumer(t *testing.T) {

	log.SetOutput(os.Stdout)

	var pactDir = os.Getenv("PACT_DIR")
	var pactConsumer = os.Getenv("PACT_CONSUMER")
	var pactProvider = os.Getenv("PACT_PROVIDER")
	var pactVersion = os.Getenv("PACT_VERSION")

	var pactBrokerURL = os.Getenv("PACT_BROKER_URL")
	var pactBrokerUsername = os.Getenv("PACT_BROKER_USERNAME")
	var pactBrokerPassword = os.Getenv("PACT_BROKER_PASSWORD")

	//var userName = os.Getenv("OSIO_USERNAME")

	// Create Pact connecting to local Daemon
	pact := &dsl.Pact{
		Consumer:             pactConsumer,
		Provider:             pactProvider,
		PactDir:              pactDir,
		Host:                 "localhost",
		LogLevel:             "INFO",
		PactFileWriteMode:    "overwrite",
		SpecificationVersion: 2,
	}
	defer pact.Teardown()

	// Test interactions
	AuthAPIStatus(t, pact)
	AuthAPIUserByName(t, pact, TestUserName)
	AuthAPIUserByID(t, pact, TestUserID)
	AuthAPIUserByToken(t, pact, TestJWSToken)

	// Negative tests
	AuthAPIUserInvalidToken(t, pact, TestInvalidJWSToken)
	AuthAPIUserNoToken(t, pact)

	log.Printf("All tests done, writting a pact to %s directory.\n", pactDir)
	pact.WritePact()

	log.Printf("Publishing pact to a broker %s\n", pactBrokerURL)

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
		log.Fatalf("Unable to publish pact to a broker %s:\n%q\n", pactBrokerURL, err)
	}
}
