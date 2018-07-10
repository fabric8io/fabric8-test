from behave import *
from src.resetEnv import ResetEnvironment
from unittest import *


@when(u'I reset environment')
def step_impl(context):
    global resetEnv
    resetEnv = ResetEnvironment()
    resetEnv.removeSpaces()
    resetEnv.cleanTenant()


@then(u'I should see clean environment')
def step_impl(context):
    assert len(resetEnv.getSpaces()) == 0
