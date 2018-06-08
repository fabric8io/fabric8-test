from behave import *
from src.support import helpers

@given(u'I am logged in to OpenShift.io')
def step_impl(context):
    assert helpers.is_user_logged_in()


@when(u'I input a spacename')
def step_impl(context):
    raise NotImplementedError(u'STEP: When I input a spacename')


@then(u'I should see a new space created')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then I should see a new space created')
