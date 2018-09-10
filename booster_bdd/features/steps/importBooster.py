import os

from behave import given, when, then
from features.src.importBooster import ImportBooster
from features.src import importBooster
from features.src.support import helpers
from pyshould import should, should_not


@given(u'I have a space created')
def given_space_created(_context):
    global spaceID
    spaceID = helpers.getSpaceID()
    spaceID | should_not.be_none().desc("Space ID")

    global ib
    ib = ImportBooster()


@when(u'I input a name of the GitHub repository with a booster')
def when_input_github_repo(_context):
    helpers.setGithubRepo(os.getenv('GIT_REPO'))
    importBooster.boosterImported | should.be_false.desc("Booster not imported, yet.")
    result = ib.importGithubRepo(helpers.getGithubRepo())
    print('Result = {}'.format(result))


@then(u'I should see the booster imported')
def then_booster_imported(_context):
    importBooster.boosterImported | should.be_true.desc("A GitHub repository imported.")
