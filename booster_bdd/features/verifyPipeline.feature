Feature: Verify an imported Booster's pipeline is created
 
  Background:
    Given I am logged in to OpenShift.io
    And I have imported a booster
 
  Scenario: verifyPipeline the Booster's new pipeline
    When I input query a pipeline's ID
    Then I should see the newly created build in a "New" state"
    Then I should see the build in a "Running" state
    Then I should see the build ready to be promoted to "Run" stage
    Then I should see the build completed
