import os

from behave import *
from features.src.importBooster import *
from features.src.support import *
from pyshould import *


@given(u'I have a space created')
def step_impl(context):
    global spaceID
    spaceID = helpers.getSpaceID()
    spaceID | should_not.be_none().desc("Space ID")

    print('Attempting to use OSIO booster service intregration POC...')
    global importBooster
    importBooster = ImportBooster()


@when(u'I input a name of the GitHub repository with a booster')
def step_impl(context):
    global result
    result = importBooster.importGithubRepo(os.getenv('GIT_REPO'))
    print('Result = {}'.format(result))


@then(u'I should see the booster imported')
def step_impl(context):
    global result
    result | should.equal('Success').desc("Result of importing a GitHub repository")
