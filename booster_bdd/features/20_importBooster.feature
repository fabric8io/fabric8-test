Feature: Import a new Booster into OpenShift.io
 
  Background:
    Given I have a space created
 
  Scenario: Import booster from a GitHub repository
    When I input a name of the GitHub repository with a booster
    Then I should see the booster imported
