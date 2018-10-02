"""Steps implementation for following scenarios: verifyStage.feature."""

from behave import given, when, then
from features.src.stage import Stage
from features.src import pipeline
from pyshould import should


@given(u'I have verified a booster\'s pipeline has completed')
def given_pipeline_completed(context):
    """Precondition that the pipeline has been verified."""
    pipeline.pipelineVerified | should.be_true.desc("Pipeline verified")
    print('Attempting to use query for Pipeline deployed to Stage...')
    context.stage = Stage()


@when(u'I query a pipeline\'s stage endpoint')
def when_query_pipeline(context):
    """Query a pipeline's stage endpoint."""
    result = context.stage.runTest('testing stage endpoint')
    print('Result = {}'.format(result))
    context.result = result


@then(u'I should see the deployed app running on stage')
def then_app_running_stage(context):
    """Check that the app is deployed and running on stage."""
    result = context.result
    result | should.equal('Success').desc("Application is not reachable in the Stage stage.")
