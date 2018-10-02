"""Steps implementation for following scenarios: reset user's environment in OpenShift.io."""

from behave import when, then
from features.src.resetEnv import ResetEnvironment
from pyshould import should


@when(u'I reset environment')
def when_reset_environment(context):
    """Reset the environment."""
    resetEnv = ResetEnvironment()
    resetEnv.removeSpaces()
    resetEnv.cleanTenant()
    context.resetEnv = resetEnv


@then(u'I should see clean environment')
def then_clean_environment(context):
    """Check that environment has been reset."""
    len(context.resetEnv.getSpaces()) | should.equal(0).described_as(
        "Number of spaces after environment reset."
    )
