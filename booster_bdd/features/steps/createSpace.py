import behave
from features.src.support import helpers
from features.src.space import Space
from pyshould import *


@when(u'I input a spacename')
def step_impl(context):
    space = Space()
    spaceID = space.createSpace(helpers.create_space_name())
    helpers.setSpaceID(spaceID)


@then(u'I should see a new space created')
def step_impl(context):
    spaceID = helpers.getSpaceID()
    spaceID | should_not.be_none().desc("Created space ID")
