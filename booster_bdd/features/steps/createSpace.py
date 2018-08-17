from behave import when, then
from features.src.support import helpers
from features.src.space import Space
from pyshould import should_not


@when(u'I input a spacename')
def when_input_space_name(_context):
    space = Space()
    spaceID = space.createSpace(helpers.create_space_name())
    helpers.setSpaceID(spaceID)


@then(u'I should see a new space created')
def then_space_created(_context):
    spaceID = helpers.getSpaceID()
    spaceID | should_not.be_none().desc("Created space ID")
