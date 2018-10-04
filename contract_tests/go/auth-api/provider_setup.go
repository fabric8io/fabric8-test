// Package main contains a runnable Consumer Pact test example.
package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
)

// ProviderState represents JSON request for 'state setup' from Pact
type ProviderState struct {
	// Consumer name
	Consumer string `json:"consumer"`
	// State
	State string `json:"state"`
	// States
	States []string `json:"states"`
}

func main() {
	// nop
}

// ProviderSetup starts a setup service for a provider - should be replaced by a provider setup endpoint
func ProviderSetup(setupHost string, setupPort int, providerBaseURL string, userName string, userID string) {
	http.HandleFunc("/pact/setup", func(w http.ResponseWriter, r *http.Request) {
		body, err := ioutil.ReadAll(r.Body)
		if err != nil {
			fmt.Printf(">>> ERROR: Unable to read request body.\n %q", err)
			return
		}

		var providerState ProviderState
		json.Unmarshal(body, &providerState)

		switch providerState.State {
		case fmt.Sprintf("User with username %s exists.", userName):
			fmt.Printf(">>>> TODO: Create username with username=%s\n", userName)
		case fmt.Sprintf("User with ID %s exists.", userID):
			fmt.Printf(">>>> TODO: Create username with ID=%s\n", userID)
		case
			"No user exists with the given token valid.",
			"Any user exists but no auth token was provided.":
			fmt.Printf(">>>> %s\n", providerState.State)
		default:
			fmt.Printf(">>>> TODO: State \"%s\" not impemented.\n", providerState.State)
		}

		fmt.Fprintf(w, ">>>> Provider states has ben set up.\n")
	})

	var setupURL = fmt.Sprintf("%s:%d", setupHost, setupPort)
	fmt.Printf(">>> Starting ProviderSetup and listening at %s\n", setupURL)
	log.Fatal(http.ListenAndServe(setupURL, nil))

}
