from behave import when, then
from features.src.support import helpers
from features.src.workspace import Workspace
from pyshould import should_not, should


@when(u'I create the workspace')
def when_create_workspace(context):
    spaceName = helpers.getSpaceName()
    workspace = Workspace()
    workspaceID = workspace.createWorkspace(spaceName)
    helpers.setWorkspaceID(workspaceID)


@then(u'I should see the newly created workspace')
def then_workspace_created(context):
    workspaceID = helpers.getWorkspaceID()
    workspaceID | should_not.be_none().desc("Created workspace ID")


@then(u'I should see the workspace started')
def then_workspace_started(context):
    workspaceID = helpers.getWorkspaceID()
    workspace = Workspace()
    workspaceStatus = workspace.workspaceStatus(workspaceID, 10, "RUNNING")
    workspaceStatus | should.be_true().desc("Started workspace")


@then(u'I should see the workspace stopped')
def then_workspace_stopped(context):
    workspaceID = helpers.getWorkspaceID()
    workspace = Workspace()
    workspace.workspaceStop(workspaceID)
    workspaceStatus = workspace.workspaceStatus(workspaceID, 10, "STOPPED")
    workspaceStatus | should.be_true().desc("Stopped workspace")


@then(u'I should see the workspace deleted')
def then_workspace_deleted(context):
    workspaceID = helpers.getWorkspaceID()
    workspace = Workspace()
    workspace.workspaceDelete(workspaceID)
    workspaceDeleteStatus = workspace.workspaceDeleteStatus(workspaceID)
    workspaceDeleteStatus | should.be_true().desc("Deleted workspace")
