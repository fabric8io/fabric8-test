@osio.regular
Feature: Create a Che workspace
 
  Background:
    Given I am logged in to OpenShift.io

  @osio.zabbix-metric.create-workspace
  Scenario: Create the Booster's Che workspace
    When I create the workspace
    Then I should see the newly created workspace
    Then I should see the workspace started
    Then I should see the workspace stopped
    Then I should see the workspace deleted
 