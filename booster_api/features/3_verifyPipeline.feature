Feature: Verify an imported Booster's pipeline is created
 
  Background:
    Given I have imported a booster
 
  Scenario: verifyPipeline the Booster's new pipeline
    When I input query a pipeline's ID
    Then I should see the pipeline status as "Running"


