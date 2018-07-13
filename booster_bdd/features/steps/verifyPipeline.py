from behave import *
from src.pipeline import Pipeline


@given(u'I have imported a booster')
def step_impl(context):
    print('Attempting to use query for running Pipeline...')
    global pipeline
    pipeline = Pipeline()


@when(u'I input query a pipeline\'s ID')
def step_impl(context):
    global result
    result = pipeline.prepare()
    print('Result = {}'.format(result))


@then(u'I should see the newly created build in a "New" state"')
def step_impl(context):
    assert (pipeline.buildStatus(30, 5, 'New'), "Build failed to get to New state.")


@then(u'I should see the build in a "Running" state')
def step_impl(context):
    assert (pipeline.buildStatus(30, 30, 'Running'), "Build failed to get to  Running state.")


@then(u'I should see the build ready to be promoted to "Run" stage')
def step_impl(context):
    assert (
        pipeline.buildStatus(
            30, 30, 'Running',
            'openshift.io/jenkins-pending-input-actions-json'
        ),
        "Build failed to get ready to be promoted."
    )


@then(u'I should see the build completed')
def step_impl(context):
    assert (pipeline.buildStatus(30, 10, 'Complete'), "Build failed to complete.")
