// Package main contains a runnable Consumer Pact test example.
package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"testing"

	"github.com/pact-foundation/pact-go/dsl"
)

type UserData struct {
	Attributes struct {
		Bio                   string `json:"bio" pact:"example=n/a"`
		Cluster               string `json:"cluster" pact:"example=openshift.developer.osio/"`
		Company               string `json:"company" pact:"example=n/a"`
		CreatedAt             string `json:"created-at" pact:"example=2018-03-16T14:34:31.615511Z"`
		Email                 string `json:"email" pact:"example=osio-developer@email.com"`
		EmailPrivate          bool   `json:"emailPrivate" pact:"example=False"`
		EmailVerified         bool   `json:"emailVerified" pact:"example=True"`
		FeatureLevel          string `json:"featureLevel" pact:"example=internal"`
		FullName              string `json:"fullName" pact:"example=Osio Developer"`
		IdentityID            string `json:"identityID" pact:"example=c46445eb-2448-4c91-916a-2c1de3e6f63e"`
		ImageURL              string `json:"imageURL" pact:"example=n/a"`
		ProviderType          string `json:"providerType" pact:"example=kc"`
		RegistrationCompleted bool   `json:"registrationCompleted" pact:"example=True"`
		UpdatedAt             string `json:"updated-at" pact:"example=2018-05-30T11:05:23.513612Z"`
		URL                   string `json:"url" pact:"example=n/a"`
		UserID                string `json:"userID" pact:"example=5f41b66e-6f84-42b3-ab5f-8d9ef21149b1"`
		Username              string `json:"username" pact:"example=developer"`
	} `json:"attributes"`
	ID    string `json:"id" pact:"example=c46445eb-2448-4c91-916a-2c1de3e6f63e"`
	Links struct {
		Related string `json:"related" pact:"example=http://localhost:8089/api/users/c46445eb-2448-4c91-916a-2c1de3e6f63e"`
		Self    string `json:"self" pact:"example=http://localhost:8089/api/users/c46445eb-2448-4c91-916a-2c1de3e6f63e"`
	} `json:"links"`
	Type string `json:"type" pact:"example=identities"`
}

type User struct {
	data UserData `json:"data"`
}

type Users struct {
	data []UserData `json:"data"`
}

type InvalidToken struct {
	Errors []struct {
		Code   string `json:"code" pact:"example=token_validation_failed"`
		Detail string `json:"detail" pact:"example=token is invalid"`
		ID     string `json:"id" pact:"example=76J0ww+6"`
		Status string `json:"status" pact:"example=401"`
		Title  string `json:"title" pact:"example=Unauthorized"`
	} `json:"errors"`
}

type MissingToken struct {
	Errors []struct {
		Code   string `json:"code" pact:"example=jwt_security_error"`
		Detail string `json:"detail" pact:"example=missing header \"Authorization\""`
		ID     string `json:"id" pact:"example=FRzHbogQ"`
		Status string `json:"status" pact:"example=401"`
		Title  string `json:"title" pact:"example=Unauthorized"`
	} `json:"errors"`
}

const jwsRegex = "[a-zA-Z0-9\\-_]+?\\.?[a-zA-Z0-9\\-_]+?\\.?([a-zA-Z0-9\\-_]+)?"
const userNameRegex = "[a-zA-Z\\-0-9]+"
const userIDRegex = "[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-4[a-fA-F0-9]{3}-[8|9|aA|bB][a-fA-F0-9]{3}-[a-fA-F0-9]{12}"

var userName = os.Getenv("OSIO_USERNAME")
var userID = os.Getenv("OSIO_USER_ID")

// AuthAPIUserByNameConsumer defines contract of /api/users?filter[username]=<user_name> endpoint
func AuthAPIUserByNameConsumer(t *testing.T, pact *dsl.Pact) {

	fmt.Printf("Invoking AuthAPIUserByNameConsumer test interaction now\n")

	// Pass in test case
	var test = func() error {
		url := fmt.Sprintf("http://localhost:%d/api/users?filter[username]=%s", pact.Server.Port, userName)
		req, err := http.NewRequest("GET", url, nil)

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

	// Set up our expected interactions.
	pact.
		AddInteraction().
		Given(fmt.Sprintf("User with username %s exists.", userName)).
		UponReceiving("A request to get user's information by username").
		WithRequest(dsl.Request{
			Method: "GET",
			Path:   dsl.String("/api/users"),
			Query: dsl.MapMatcher{
				"filter[username]": dsl.Term(
					userName,
					userNameRegex,
				),
			},
			Headers: dsl.MapMatcher{"Content-Type": dsl.String("application/json")},
		}).
		WillRespondWith(dsl.Response{
			Status:  200,
			Headers: dsl.MapMatcher{"Content-Type": dsl.String("application/vnd.api+json")},
			Body:    dsl.Match(Users{}),
		})

	// Verify
	if err := pact.Verify(test); err != nil {
		log.Fatalf("Error on Verify: %v", err)
	}
}

// AuthAPIUserByIDConsumer defines contract of /api/users/<user_id> endpoint
func AuthAPIUserByIDConsumer(t *testing.T, pact *dsl.Pact) {

	fmt.Printf("Invoking AuthAPIUserByIDConsumer test interaction now\n")

	// Pass in test case
	var test = func() error {
		url := fmt.Sprintf("http://localhost:%d/api/users/%s", pact.Server.Port, userID)
		req, err := http.NewRequest("GET", url, nil)

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

	// Set up our expected interactions.
	pact.
		AddInteraction().
		Given(fmt.Sprintf("User with ID %s exists.", userID)).
		UponReceiving("A request to get user's information by ID").
		WithRequest(dsl.Request{
			Method: "GET",
			Path: dsl.Term(
				fmt.Sprintf("/api/users/%s", userID),
				fmt.Sprintf("/api/users/%s", userIDRegex),
			),
			Headers: dsl.MapMatcher{"Content-Type": dsl.String("application/json")},
		}).
		WillRespondWith(dsl.Response{
			Status:  200,
			Headers: dsl.MapMatcher{"Content-Type": dsl.String("application/vnd.api+json")},
			Body:    dsl.Match(User{}),
		})

	// Verify
	if err := pact.Verify(test); err != nil {
		log.Fatalf("Error on Verify: %v", err)
	}
}

// AuthAPIUserByToken defines contract of /api/user endpoint with valid auth token
// passed as 'Authorization: Bearer ...' header
func AuthAPIUserByToken(t *testing.T, pact *dsl.Pact) {

	fmt.Printf("Invoking AuthAPIUserByToken test interaction now\n")

	var userToken = os.Getenv("OSIO_USER_AUTH_TOKEN")

	// Pass in test case
	var test = func() error {
		url := fmt.Sprintf("http://localhost:%d/api/user", pact.Server.Port)
		req, err := http.NewRequest("GET", url, nil)

		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", userToken))
		if err != nil {
			return err
		}

		_, err = http.DefaultClient.Do(req)
		if err != nil {
			return err
		}
		return err
	}

	// Set up our expected interactions.
	pact.
		AddInteraction().
		Given("A user exists with the given valid token.").
		UponReceiving("A request to get user's information with valid auth token ").
		WithRequest(dsl.Request{
			Method: "GET",
			Path:   dsl.String("/api/user"),
			Headers: dsl.MapMatcher{
				"Content-Type": dsl.String("application/json"),
				"Authorization": dsl.Term(
					fmt.Sprintf("Bearer %s", userToken),
					fmt.Sprintf("^Bearer %s$", jwsRegex),
				),
			},
		}).
		WillRespondWith(dsl.Response{
			Status:  200,
			Headers: dsl.MapMatcher{"Content-Type": dsl.String("application/vnd.api+json")},
			Body:    dsl.Match(User{}),
		})

	// Verify
	if err := pact.Verify(test); err != nil {
		log.Fatalf("Error on Verify: %v", err)
	}
}

// AuthAPIUserInvalidToken defines contract of /api/user endpoint with invalid auth token
func AuthAPIUserInvalidToken(t *testing.T, pact *dsl.Pact) {

	fmt.Printf("Invoking AuthAPIUserInvalidToken test interaction now\n")

	// Base64 encoded '{"alg":"RS256","kid":"1aA2bBc3CDDdEEefff7gGHH_ii9jJjkkkLl2mmm4NNO","typ":"JWT"}somerandombytes'
	var invalidToken = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjFhQTJiQmMzQ0REZEVFZWZmZjdnR0hIX2lpOWpKamtra0xsMm1tbTROTk8iLCJ0eXAiOiJKV1QifXNvbWVyYW5kb21ieXRlcw"

	// Pass in test case
	var test = func() error {
		url := fmt.Sprintf("http://localhost:%d/api/user", pact.Server.Port)
		req, err := http.NewRequest("GET", url, nil)

		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", invalidToken))
		if err != nil {
			return err
		}

		_, err = http.DefaultClient.Do(req)
		if err != nil {
			return err
		}
		return err
	}

	// Set up our expected interactions.
	pact.
		AddInteraction().
		Given("No user exists with the given token valid.").
		UponReceiving("A request to get user's information with invalid auth token ").
		WithRequest(dsl.Request{
			Method: "GET",
			Path:   dsl.String("/api/user"),
			Headers: dsl.MapMatcher{
				"Content-Type": dsl.String("application/json"),
				"Authorization": dsl.Term(
					fmt.Sprintf("Bearer %s", invalidToken),
					fmt.Sprintf("^Bearer %s$", jwsRegex),
				),
			},
		}).
		WillRespondWith(dsl.Response{
			Status:  401,
			Headers: dsl.MapMatcher{"Content-Type": dsl.String("application/vnd.api+json")},
			Body:    dsl.Match(InvalidToken{}),
		})

	// Verify
	if err := pact.Verify(test); err != nil {
		log.Fatalf("Error on Verify: %v", err)
	}
}

// AuthAPIUserNoToken defines contract of /api/user endpoint with invalid auth token
func AuthAPIUserNoToken(t *testing.T, pact *dsl.Pact) {

	fmt.Printf("Invoking AuthAPIUserNoToken test interaction now\n")

	// Pass in test case
	var test = func() error {
		url := fmt.Sprintf("http://localhost:%d/api/user", pact.Server.Port)
		req, err := http.NewRequest("GET", url, nil)

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

	// Set up our expected interactions.
	pact.
		AddInteraction().
		Given("Any user exists but no auth token was provided.").
		UponReceiving("A request to get user's information with no auth token ").
		WithRequest(dsl.Request{
			Method: "GET",
			Path:   dsl.String("/api/user"),
			Headers: dsl.MapMatcher{
				"Content-Type": dsl.String("application/json"),
			},
		}).
		WillRespondWith(dsl.Response{
			Status:  401,
			Headers: dsl.MapMatcher{"Content-Type": dsl.String("application/vnd.api+json")},
			Body:    dsl.Match(MissingToken{}),
		})

	// Verify
	if err := pact.Verify(test); err != nil {
		log.Fatalf("Error on Verify: %v", err)
	}
}
