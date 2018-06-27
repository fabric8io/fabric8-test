import os

from behave import *
from src.import_booster import ImportBooster
from src.support import helpers
from unittest import *

@given(u'I have a space created')
def step_impl(context):
    global spaceID
    spaceID = helpers.getSpaceID()
    assert spaceID != None

    print ('Attempting to use OSIO booster service intregration POC...')
    global importBooster
    importBooster = ImportBooster()

@when(u'I input a name of the GitHub repository with a booster')
def step_impl(context):
    global result
    result = importBooster.importGithubRepo(os.getenv('GIT_REPO'))
    print ('Result = {}'.format(result))

@then(u'I should see the booster imported')
def step_impl(context):
    global expected_result
    expected_result = 'Success'
    assert (expected_result == result)

