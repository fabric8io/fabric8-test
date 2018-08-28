from behave import given, when, then
from features.src.stage import Stage
from features.src.pipeline import pipelineVerified
from pyshould import should


@given(u'I have verified a booster\'s pipeline has completed')
def given_pipeline_completed(_context):
    global pipelineVerified
    pipelineVerified | should.be_true.desc("Pipeline verified")
    print('Attempting to use query for Pipeline deployed to Stage...')
    global stage
    stage = Stage()


@when(u'I query a pipeline\'s stage endpoint')
def when_query_pipeline(_context):
    global result
    result = stage.runTest('testing stage endpoint')
    print('Result = {}'.format(result))


@then(u'I should see the deployed app running on stage')
def then_app_running_stage(_context):
    global result
    result | should.equal('Success').desc("Application is not reachable in the Stage stage.")
