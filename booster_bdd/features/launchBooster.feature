@osio.regular
Feature: Launch a new Booster in OpenShift.io

  Background:
    Given I am logged in to OpenShift.io
    And I have a space created from which I can launch a new booster

  Scenario: Launch new booster in OpenShift.io
    When I input input the name, mission, runtime, and pipeline of the new booster
    Then I should see the booster created
