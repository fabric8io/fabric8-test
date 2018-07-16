from behave import *
from features.src.pipeline import *


@given(u'I have imported a booster')
def step_impl(context):
    print('Attempting to use query for running Pipeline...')
    global pipeline
    pipeline = Pipeline()


@when(u'I check the pipeline')
def step_impl(context):
    pass


@then(u'I should see the newly created build in a "New" state"')
def step_impl(context):
    assert pipeline.buildStatus(30, 5, 'New'), "Build failed to get to New state."


@then(u'I should see the build in a "Running" state')
def step_impl(context):
    assert pipeline.buildStatus(30, 30, 'Running'), "Build failed to get to  Running state."


@then(u'I should see the build ready to be promoted to "Run" stage')
def step_impl(context):
    assert pipeline.buildStatus(30, 30, 'Running',
                                'openshift.io/jenkins-pending-input-actions-json'
                                ), "Build failed to get ready to be promoted."


@given(u'The build is ready to be promoted to "Run" stage')
def step_impl(context):
    assert pipeline.buildStatus(30, 30, 'Running',
                                'openshift.io/jenkins-pending-input-actions-json'
                                ), "Build failed to get ready to be promoted."


@when(u'I promote the build to "Run" stage')
def step_impl(context):
    assert pipeline.promoteBuild()


@then(u'I should see the build completed')
def step_impl(context):
    assert pipeline.buildStatus(30, 10, 'Complete'), "Build failed to complete."
