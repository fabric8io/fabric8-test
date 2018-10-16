@osio.regular
Feature: Verify Stack Analysis Report in OpenShift.io

  Background:
    Given I am logged in to OpenShift.io

  @osio.zabbix-metric.stack-analyses
  Scenario: Check that the stack-analyses returns a valid response for maven ecosystem
    When I send Maven package manifest pom-effective.xml to stack analysis
    Then I should receive JSON response with stack analysis data
