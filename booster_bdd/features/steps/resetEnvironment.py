from behave import *
from features.src.resetEnv import ResetEnvironment
from pyshould import *


@when(u'I reset environment')
def step_impl(context):
    global resetEnv
    resetEnv = ResetEnvironment()
    resetEnv.removeSpaces()
    resetEnv.cleanTenant()


@then(u'I should see clean environment')
def step_impl(context):
    global resetEnv
    len(resetEnv.getSpaces()) | should.equal(1).described_as("Number of spaces after environment reset.")
