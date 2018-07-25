import os
import sys
from behave import given, when, then
from features.src.support import helpers
from pyshould import *


@given(u'I am unlogged in to OpenShift.io')
def unlogged_in(_context):
    helpers.is_user_logged_in() | should.be_false.desc("User should be logged out.")


@given(u'I am logged in to OpenShift.io')
def logged_in(_context):
    helpers.is_user_logged_in() | should.be_true.desc("User should be logged in.")


@when(u'I login to Openshift.io with username and password')
def login_user(_context):
    username = os.getenv("OSIO_USERNAME")
    password = os.getenv("OSIO_PASSWORD")
    username | should_not.be_empty.desc("OSIO username")
    password | should_not.be_empty.desc("OSIO password")
    helpers.login_user(username, password)


@then(u'I should be logged in to OpenShift.io')
def then_user_is_logged_in(_context):
    helpers.is_user_logged_in() | should.be_true("User should be logged in.")
