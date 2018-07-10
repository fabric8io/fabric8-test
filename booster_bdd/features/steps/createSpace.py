from behave import *
from src.support import helpers
from src.space import *


@when(u'I input a spacename')
def step_impl(context):
    space = Space()
    spaceID = space.createSpace(helpers.create_space_name())
    helpers.setSpaceID(spaceID)


@then(u'I should see a new space created')
def step_impl(context):
    spaceID = helpers.getSpaceID()
    assert spaceID is not None
