import os
import sys
from behave import *
from src.support import helpers


@given(u'I am unlogged in to OpenShift.io')
def unlogged_in(context):
    assert not (helpers.is_user_logged_in())


@given(u'I am logged in to OpenShift.io')
def logged_in(context):
    assert helpers.is_user_logged_in()


@when(u'I login to Openshift.io with username and password')
def login_user(context):
    username = os.getenv("OSIO_USERNAME")
    password = os.getenv("OSIO_PASSWORD")
    assert username != ""
    assert password != ""
    helpers.login_user(username, password)


@then(u'I should be logged in to OpenShift.io')
def then_user_is_logged_in(context):
    global user_tokens
    assert helpers.is_user_logged_in()
