import os

from behave import given, when, then
from features.src.importBooster import ImportBooster
from features.src.support import helpers
from pyshould import should, should_not


@given(u'I have a space created')
def given_space_created(_context):
    global spaceID
    spaceID = helpers.getSpaceID()
    spaceID | should_not.be_none().desc("Space ID")

    print('Attempting to use OSIO booster service intregration POC...')
    global importBooster
    importBooster = ImportBooster()


@when(u'I input a name of the GitHub repository with a booster')
def when_input_github_repo(_context):
    global result
    helpers.setGithubRepo(os.getenv('GIT_REPO'))
    result = importBooster.importGithubRepo(helpers.getGithubRepo())
    print('Result = {}'.format(result))


@then(u'I should see the booster imported')
def then_booster_imported(_context):
    global result
    result | should.equal('Success').desc("Result of importing a GitHub repository")
