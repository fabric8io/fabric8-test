from behave import given, when, then
from features.src.pipeline import *
from pyshould import *


@given(u'I have imported a booster')
def step_impl(_context):
    print('Attempting to use query for running Pipeline...')
    global pipeline
    pipeline = Pipeline()


@when(u'I check the pipeline')
def step_impl(_context):
    pass


@then(u'I should see the newly created build in a "New" state"')
def step_impl(_context):
    pipeline.buildStatus(30, 5, 'New') | should.be_true.desc("Build failed to get to New state")


@then(u'I should see the build in a "Running" state')
def step_impl(_context):
    pipeline.buildStatus(30, 30, 'Running') | should.be_true.desc(
        "Build failed to get to Running state.")


@then(u'I should see the build ready to be promoted to "Run" stage')
def step_impl(_context):
    pipeline.buildStatus(30, 30, 'Running',
                         'openshift.io/jenkins-pending-input-actions-json'
                         ) | should.be_true.desc("Build failed to get ready to be promoted.")


@given(u'The build is ready to be promoted to "Run" stage')
def step_impl(_context):
    pipeline.buildStatus(30, 30, 'Running',
                         'openshift.io/jenkins-pending-input-actions-json'
                         ) | should.be_true.desc("Build failed to get ready to be promoted.")


@when(u'I promote the build to "Run" stage')
def step_impl(_context):
    pipeline.promoteBuild() | should.be_true.desc("Build failed to promote to Run stage.")


@then(u'I should see the build completed')
def step_impl(_context):
    pipeline.buildStatus(30, 10, 'Complete') | should.be_true.desc("Build failed to complete.")
