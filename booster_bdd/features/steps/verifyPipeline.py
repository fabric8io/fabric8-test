from behave import given, when, then
from features.src.pipeline import Pipeline
from pyshould import should


@given(u'I have imported a booster')
def given_imported_booster(_context):
    print('Attempting to use query for running Pipeline...')
    global pipeline
    pipeline = Pipeline()


@when(u'I check the pipeline')
def when_check_pipeline(_context):
    pass


@then(u'I should see the newly created build in a "New" state"')
def then_new_state(_context):
    pipeline.buildStatus(30, 5, 'New') | should.be_true.desc("Build failed to get to New state")


@then(u'I should see the build in a "Running" state')
def then_running_state(_context):
    pipeline.buildStatus(30, 30, 'Running') | should.be_true.desc(
        "Build failed to get to Running state.")


@then(u'I should see the build ready to be promoted to "Run" stage')
def then_promote_state(_context):
    pipeline.buildStatus(30, 30, 'Running',
                         'openshift.io/jenkins-pending-input-actions-json'
                         ) | should.be_true.desc("Build failed to get ready to be promoted.")


@given(u'The build is ready to be promoted to "Run" stage')
def given_ready_promoted(_context):
    pipeline.buildStatus(30, 30, 'Running',
                         'openshift.io/jenkins-pending-input-actions-json'
                         ) | should.be_true.desc("Build failed to get ready to be promoted.")


@when(u'I promote the build to "Run" stage')
def when_promote_to_run(_context):
    pipeline.promoteBuild() | should.be_true.desc("Build failed to promote to Run stage.")


@then(u'I should see the build completed')
def then_build_completed(_context):
    pipeline.buildStatus(30, 10, 'Complete') | should.be_true.desc("Build failed to complete.")
