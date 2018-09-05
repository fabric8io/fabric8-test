@osio.regular
Feature: Create a new space in OpenShift.io

  Background:
    Given I am logged in to OpenShift.io

  @osio.zabbix-metric.create-space
  Scenario: Create a new space
    When I input a spacename
    Then I should see a new space created
