Feature: Reset user's environment in OpenShift.io

  Background:
    Given I am logged in to OpenShift.io

  Scenario: runTest our POC
    When I reset environment
    Then I should see clean environment


