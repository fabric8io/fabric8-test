// Package osiostatus contains a runnable Consumer Pact test example.
package osiostatus

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
)

// ProviderState represents JSON request for 'state setup' from Pact
type ProviderState struct {
	Consumer string   `json:consumer`
	State    string   `json:state`
	States   []string `json:states`
}

// ProviderSetup starts a setup service for a provider
func ProviderSetup(setupHost string, setupPort int, providerBaseURL string) {
	http.HandleFunc("/pact/setup", func(w http.ResponseWriter, r *http.Request) {
		body, err := ioutil.ReadAll(r.Body)
		if err != nil {
			fmt.Printf(">>> ERROR: Unable to read request body.\n %q", err)
			return
		}

		var providerState ProviderState
		json.Unmarshal(body, &providerState)

		switch providerState.State {
		case "OSIO is up and running":
			fmt.Printf(">>> OSIO is up and running at %s\n", providerBaseURL)
		}

		fmt.Fprintf(w, "Provider states has ben set up.")
	})

	var setupURL = fmt.Sprintf("%s:%d", setupHost, setupPort)
	fmt.Printf(">>> Starting ProviderSetup and listening at %s\n", setupURL)
	log.Fatal(http.ListenAndServe(setupURL, nil))

}
