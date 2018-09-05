@osio.regular
Feature: Login user into OpenShift.io to get auth token

  @osio.zabbix-metric.login-user
  Scenario: Login user
    Given I am unlogged in to OpenShift.io
    When I login to Openshift.io with username and password
    Then I should be logged in to OpenShift.io
