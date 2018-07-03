from behave import *


@given(u'I have verified a booster\'s pipeline has had its deployment to stage verified')
def step_impl(context):
    raise NotImplementedError(
        u'STEP: Given I have verified a booster\'s pipeline has had its deployment to stage verified')


@when(u'I query a pipeline\'s run endpoint')
def step_impl(context):
    raise NotImplementedError(u'STEP: When I query a pipeline\'s run endpoint')


@then(u'I should see the deployed app running on run')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then I should see the deployed app running on run')
