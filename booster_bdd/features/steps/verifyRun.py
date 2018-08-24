from behave import given, when, then
from features.src.run import Run
from pyshould import should


@given(u'I have verified a booster\'s pipeline has had its deployment to stage verified')
def given(_context):
    print('Attempting to use query for Pipeline deployed to Run...')
    global run
    run = Run()


@when(u'I query a pipeline\'s run endpoint')
def when(_context):
    global result
    result = run.runTest('testing run endpoint')
    print('Result = {}'.format(result))


@then(u'I should see the deployed app running on run')
def then(_context):
    global result
    result | should.equal('Success').desc("Application is not reachable in the Run stage.")
