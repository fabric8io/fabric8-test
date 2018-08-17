import os

from behave import given, when, then
from features.src.launchBooster import LaunchBooster
from features.src.support import helpers
from pyshould import should, should_not


@given(u'I have a space created from which I can launch a new booster')
def given_space_created(_context):
    global spaceID
    spaceID = helpers.getSpaceID()
    spaceID | should_not.be_none().desc("Space ID")

    print('Attempting to use OSIO booster service intregration POC...')
    global launchBooster
    launchBooster = LaunchBooster()


@when(u'I input input the name, mission, runtime, and pipeline of the new booster')
def when_input_booster(_context):
    projectName = os.getenv('PROJECT_NAME')
    mission = os.getenv('BOOSTER_MISSION')
    runtime = os.getenv('BOOSTER_RUNTIME')
    pipeline = os.getenv('PIPELINE')
    blankBooster = os.getenv('BLANK_BOOSTER')
    global result
    result = launchBooster.launch(projectName, mission, runtime, pipeline, blankBooster)


@then(u'I should see the booster created')
def then_booster_created(_context):
    result | should.equal("Success").desc("Booster not created")
