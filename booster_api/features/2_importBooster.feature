Feature: Import a new Booster into OpenShift.io
 
  Background:
    Given I am using the Poc2
 
  Scenario: runTest our POC
    When I input "booster #1"
    Then I should see "Success"


