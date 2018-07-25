import os
from behave import given, when, then
from features.src.support import helpers
from pyshould import should, should_not


@given(u'I am unlogged in to OpenShift.io')
def given_unlogged(_context):
    helpers.is_user_logged_in() | should.be_false.desc("User should be logged out.")


@given(u'I am logged in to OpenShift.io')
def given_logged(_context):
    helpers.is_user_logged_in() | should.be_true.desc("User should be logged in.")


@when(u'I login to Openshift.io with username and password')
def when_login_user(_context):
    username = os.getenv("OSIO_USERNAME")
    password = os.getenv("OSIO_PASSWORD")
    username | should_not.be_empty.desc("OSIO username")
    password | should_not.be_empty.desc("OSIO password")
    helpers.login_user(username, password)


@then(u'I should be logged in to OpenShift.io')
def then_user_logged(_context):
    helpers.is_user_logged_in() | should.be_true("User should be logged in.")
