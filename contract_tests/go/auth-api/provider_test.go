package main

import (
	"encoding/base64"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/pact-foundation/pact-go/dsl"
	"github.com/pact-foundation/pact-go/types"
	"github.com/pmacik/loginusers-go/loginusers"
)

// TestAuthAPIProvider verifies the provider
func TestAuthAPIProvider(t *testing.T) {

	var pactDir = os.Getenv("PACT_DIR")
	var pactProviderBaseURL = os.Getenv("PACT_PROVIDER_BASE_URL")

	var pactConsumer = os.Getenv("PACT_CONSUMER")
	var pactProvider = os.Getenv("PACT_PROVIDER")

	var pactVersion = os.Getenv("PACT_VERSION")

	var pactBrokerUsername = os.Getenv("PACT_BROKER_USERNAME")
	var pactBrokerPassword = os.Getenv("PACT_BROKER_PASSWORD")
	var pactBrokerURL = os.Getenv("PACT_BROKER_URL")

	var userName = os.Getenv("OSIO_USERNAME")
	var userPassword = os.Getenv("OSIO_PASSWORD")

	// Create Pact connecting to local Daemon
	pact := &dsl.Pact{
		Consumer:             pactConsumer,
		Provider:             pactProvider,
		PactDir:              pactDir,
		Host:                 "localhost",
		LogLevel:             "INFO",
		SpecificationVersion: 2,
	}
	defer pact.Teardown()

	var providerSetupHost = "localhost" // this should ultimately be part of the provider api (developer mode: on)
	var providerSetupPort = 8080

	// Create user to get userid
	var user = ProviderSetup(providerSetupHost, providerSetupPort, pactProviderBaseURL, userName)

	if user == nil {
		log.Fatalf("Error returning user")
	}

	// Login user to get tokens
	userTokens, err := loginusers.LoginUsersOAuth2(pactProviderBaseURL, userName, userPassword)
	if err != nil {
		log.Fatalf("Unable to login user: %s", err)
		return
	}

	//log.Printf("Auth: %s", userTokens.AccessToken)
	//log.Printf("Refresh: %s", userTokens.RefreshToken)

	// Download pact file from pact broker
	var httpClient = &http.Client{
		Timeout: time.Second * 30,
	}
	pactURL := fmt.Sprintf("%s/pacts/provider/%s/consumer/%s/version/%s", pactBrokerURL, pactProvider, pactConsumer, pactVersion)
	request, err := http.NewRequest("GET", pactURL, nil)
	if err != nil {
		log.Fatal(err)
	}
	request.Header.Set("Accept", "application/json")
	request.Header.Set("Authorization", fmt.Sprintf("Basic %s", base64.StdEncoding.EncodeToString([]byte(fmt.Sprintf("%s:%s", pactBrokerUsername, pactBrokerPassword)))))

	log.Printf("Downloading a pact file from pact broker: %s", pactURL)
	response, err := httpClient.Do(request)
	if err != nil {
		log.Fatal(err)
	}
	defer response.Body.Close()

	responseBody, err := ioutil.ReadAll(response.Body)

	// Replace placeholders in pact file with real data (user id/token)

	pactContent := string(responseBody)
	//log.Printf("Pact taken from broker:\n%s\n", pactContent)
	pactContent = strings.Replace(pactContent, TestUserName, user.Data.Attributes.Username, -1)
	pactContent = strings.Replace(pactContent, TestUserID, user.Data.ID, -1)
	pactContent = strings.Replace(pactContent, TestJWSToken, userTokens.AccessToken, -1)
	//log.Printf("Pact filtered:\n%s\n", pactContent)

	pactFilePath := fmt.Sprintf("%s/provider-%s-%s.json", pactDir, strings.ToLower(pactConsumer), strings.ToLower(pactProvider))
	pactFile, err := os.Create(pactFilePath)
	if err != nil {
		log.Fatal(err)
	}
	defer pactFile.Close()

	_, err = pactFile.WriteString(pactContent)

	// Verify the Provider with local Pact Files
	pact.VerifyProvider(t, types.VerifyRequest{
		ProviderBaseURL:        pactProviderBaseURL,
		PactURLs:               []string{pactFilePath},
		ProviderStatesSetupURL: fmt.Sprintf("http://%s:%d/pact/setup", providerSetupHost, providerSetupPort),
	})

	log.Println("Test Passed!")
}
