Feature: Login user into OpenShift.io to get auth token

  Background:
    Given I am unlogged in to OpenShift.io

  Scenario: Login user
    When I login to Openshift.io with username and password
    Then I should be logged in to OpenShift.io


