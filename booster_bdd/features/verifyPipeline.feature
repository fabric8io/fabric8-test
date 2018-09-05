@osio.regular
Feature: Verify the imported Booster's pipeline
 
  Background:
    Given I am logged in to OpenShift.io
    And I have imported or launched a booster

  @osio.zabbix-metric.build-pipeline
  Scenario: Build the Booster's pipeline
    When I check the pipeline
    Then I should see the newly created build in a "New" state"
    Then I should see the build in a "Running" state
    Then I should see the build ready to be promoted to "Run" stage
 
  @osio.zabbix-metric.promote-build
  Scenario: Promote the build to the "Run" stage
    Given The build is ready to be promoted to "Run" stage
    When I promote the build to "Run" stage
    Then I should see the build completed
