import os

from behave import given, when, then
from features.src.importBooster import ImportBooster
from features.src import importBooster
from features.src.support import helpers
from pyshould import should, should_not


@given(u'I have a space created')
def given_space_created(_context):
    _context.spaceID = helpers.getSpaceID()
    _context.spaceID | should_not.be_none().desc("Space ID exists.")

    _context.ib = ImportBooster()


@when(u'I input a name of the GitHub repository with a booster')
def when_input_github_repo(_context):
    helpers.setGithubRepo(os.getenv('GIT_REPO'))
    importBooster.boosterImported | should.be_false.desc("Booster is not imported, yet.")
    result = _context.ib.importGithubRepo(helpers.getGithubRepo())
    print('Result = {}'.format(result))


@then(u'I should see the booster imported within {seconds} seconds')
def then_booster_imported(_context, seconds):
    _context.ib.checkCodebases(seconds)
    importBooster.boosterImported | should.be_true.desc("A GitHub repository is imported.")
