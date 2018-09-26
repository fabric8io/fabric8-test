from behave import when, then
from features.src.support import helpers
from features.src.stackAnalyses import StackAnalyses
from pyshould import should_not, should

@when(u'I send Maven package manifest pom-effective.xml to stack analysis')
def when_send_manifest(context):

    global sa
    sa = StackAnalyses()

    spaceName = helpers.getSpaceName()
    codebaseUrl = sa.getCodebaseUrl()
    stackAnalysesKey = sa.getReportKey(codebaseUrl)
    helpers.setStackReportKey(stackAnalysesKey)
    stackAnalysesKey | should_not.be_none().desc("Obtained Stack Analyses key")


@then(u'I should receive JSON response with stack analysis data')
def then_receive_stack_json(context):
    spaceName = helpers.getSpaceName()
    stackAnalysesKey = helpers.getStackReportKey()
    reportText = sa.getStackReport(stackAnalysesKey)
    reportText | should_not.be_none().desc("Obtained Stack Analyses Report")
