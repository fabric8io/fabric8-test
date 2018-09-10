import os

from behave import given, when, then
from features.src.launchBooster import LaunchBooster
from features.src import launchBooster
from features.src.support import helpers
from pyshould import should, should_not


@given(u'I have a space created from which I can launch a new booster')
def given_space_created(_context):
    global spaceID
    spaceID = helpers.getSpaceID()
    spaceID | should_not.be_none().desc("Space ID")

    global lb
    lb = LaunchBooster()


@when(u'I input input the name, mission, runtime, and pipeline of the new booster')
def when_input_booster(_context):
    projectName = os.getenv('PROJECT_NAME')
    mission = os.getenv('BOOSTER_MISSION')
    boosterRuntime = os.getenv('BOOSTER_RUNTIME').split(":", 1)
    runtime = boosterRuntime[0]
    version = boosterRuntime[1]
    pipeline = os.getenv('PIPELINE')
    blankBooster = os.getenv('BLANK_BOOSTER')

    launchBooster.boosterLaunched | should.be_false.desc("Booster not created, yet.")
    result = lb.launch(projectName, mission, runtime, version, pipeline, blankBooster)
    print('Result = {}'.format(result))


@then(u'I should see the booster created')
def then_booster_created(_context):
    launchBooster.boosterLaunched | should.be_true.desc("Booster created.")
