import traceback

from behave import given, when, then
from features.src.pipeline import Pipeline
from features.src.support import helpers
from features.src import pipeline
from features.src import importBooster
from features.src import launchBooster
from pyshould import should


@given(u'I have imported or launched a booster')
def given_imported_or_launched_booster(_context):
    (importBooster.boosterImported or launchBooster.boosterLaunched) | should.be_true.desc(
        "Booster imported or launched"
    )


@when(u'I check the pipeline')
def when_check_pipeline(_context):
    print('Attempting to use query for running Pipeline...')
    global pl
    pl = Pipeline()


@then(u'I should see the newly created build in a "New" state')
def then_new_state(_context):
    pl.buildStatus(30, 5, 'New') | should.be_true.desc("Build is in New state")


@then(u'I should see the build in a "Running" state')
def then_running_state(_context):
    pl.buildStatus(30, 30, 'Running') | should.be_true.desc(
        "Build failed to get to Running state.")


@then(u'I should see the build ready to be promoted to "Run" stage')
def then_promote_state(_context):
    pl.buildStatus(30, 30, 'Running',
                   'openshift.io/jenkins-pending-input-actions-json'
                   ) | should.be_true.desc("Build is ready to be promoted.")


@given(u'The build is ready to be promoted to "Run" stage')
def given_ready_promoted(_context):
    pl.buildStatus(30, 30, 'Running',
                   'openshift.io/jenkins-pending-input-actions-json'
                   ) | should.be_true.desc("Build is ready to be promoted.")


@when(u'I promote the build to "Run" stage')
def when_promote_to_run(_context):
    pl.promoteBuild() | should.be_true.desc("Build is promoted to Run stage.")


@then(u'I should see the build completed')
def then_build_completed(_context):
    try:
        pl.buildStatus(30, 10, 'Complete') | should.be_true.desc("Build is complete.")
        pipeline.pipelineVerified = True
    finally:
        helpers.gather_pod_logs(_context, "jenkins")
