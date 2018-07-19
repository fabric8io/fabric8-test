import os

from behave import *
from features.src.importBooster import *
from features.src.support import *

@given(u'I have a space created from which I can launch a new booster')
def step_impl(context):
    global spaceID
    spaceID = helpers.getSpaceID()
    assert spaceID is not None

    print('Attempting to use OSIO booster service intregration POC...')
    global importBooster
    importBooster = ImportBooster()

@when(u'I input input the name, mission, runtime, and pipeline of the new booster')
def step_impl(context):
    raise NotImplementedError(u'STEP: When I input input the name, mission, runtime, and pipeline of the new booster')

@then(u'I should see the booster created')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then I should see the booster created')

