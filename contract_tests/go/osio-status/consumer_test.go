// Package osiostatus contains a runnable Consumer Pact test example.
package osiostatus

import (
	"fmt"
	"log"
	"net/http"
	"testing"

	"github.com/pact-foundation/pact-go/dsl"
)

func TestOsioStatusConsumer(t *testing.T) {
	// Create Pact connecting to local Daemon
	pact := &dsl.Pact{
		Consumer: "OsioStatusConsumer",
		Provider: "OsioStatusProvider",
		Host:     "localhost",
	}
	defer pact.Teardown()

	// Pass in test case
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

	type STATUS struct {
		buildTime string `json:"buildTime" pact:"example=2018-09-10T11:08:26Z"`
		commit    string `json:"commit" pact:"example=164762f67a3a7634fa4ee1e8bb55c458281803c7-dirty"`
		startTime string `json:"startTime" pact:"example=2018-09-29T16:08:15Z"`
	}

	// Set up our expected interactions.
	pact.
		AddInteraction().
		Given("OSIO is up and running").
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

	// Verify
	if err := pact.Verify(test); err != nil {
		log.Fatalf("Error on Verify: %v", err)
	}

	fmt.Println("Test Passed!")
}
