import os, sys
from behave import *
from src.support import helpers

@given(u'I am unlogged in to OpenShift.io')
def step_impl(context):
   assert not (helpers.is_user_logged_in())


@when(u'I login to Openshift.io with username and password')
def step_impl(context):
   username = os.getenv("OSIO_USERNAME")
   password = os.getenv("OSIO_PASSWORD")
   assert username != ""
   assert password != ""
   helpers.login_user(username, password)


@then(u'I should be logged in to OpenShift.io')
def step_impl(context):
   global user_tokens
   sys.stdout.write(helpers.get_user_tokens())
   assert helpers.is_user_logged_in()
