@osio.danger-zone
Feature: Reset user's environment in OpenShift.io

  Background:
    Given I am logged in to OpenShift.io
  
  @osio.zabbix-metric.reset-osio-environment
  Scenario: Reset OSIO environment
    When I reset environment
    Then I should see clean environment
