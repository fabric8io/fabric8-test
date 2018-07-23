@osio.regular
Feature: Verify an imported Booster's pipeline is deployed to stage
 
  Background:
    Given I am logged in to OpenShift.io
    And I have verified a booster's pipeline has completed
 
  Scenario: verifyStage the Booster's deployment to stage
    When I query a pipeline's stage endpoint
    Then I should see the deployed app running on stage
