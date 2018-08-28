from behave import given, when, then
from features.src.run import Run
from features.src import stage
from pyshould import should


@given(u'I have verified a booster\'s pipeline has had its deployment to stage verified')
def given_stage_deployed(_context):
    stage.stageDeployed | should.be_true.desc("Stage deployed and verified.")
    print('Attempting to use query for Pipeline deployed to Run...')
    global run
    run = Run()


@when(u'I query a pipeline\'s run endpoint')
def when_query_pipeline(_context):
    global result
    result = run.runTest('testing run endpoint')
    print('Result = {}'.format(result))


@then(u'I should see the deployed app running on run')
def then_run_deployed(_context):
    global result
    result | should.equal('Success').desc("Application is not reachable in the Run stage.")
