@osio.regular
Feature: Verify an imported Booster's pipeline is deployed to run
 
  Background:
    Given I am logged in to OpenShift.io
    And I have verified a booster's pipeline has had its deployment to stage verified
 
  @osio.zabbix-metric.verify-run
  Scenario: Verify the Booster's deployment to run
    When I query a pipeline's run endpoint
    Then I should see the deployed app running on run
