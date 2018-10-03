from behave import when, then
from features.src.support import helpers
from features.src.stackAnalyses import StackAnalyses
from pyshould import should_not


@when(u'I send Maven package manifest pom-effective.xml to stack analysis')
def when_send_manifest(context):

    sa = StackAnalyses()

    codebaseUrl = sa.getCodebaseUrl()
    stackAnalysesKey = sa.getReportKey(codebaseUrl)
    helpers.setStackReportKey(stackAnalysesKey)
    stackAnalysesKey | should_not.be_none().desc("Obtained Stack Analyses key")
    context.sa = sa


@then(u'I should receive JSON response with stack analysis data')
def then_receive_stack_json(context):
    stackAnalysesKey = helpers.getStackReportKey()
    reportText = context.sa.getStackReport(stackAnalysesKey)
    reportText | should_not.be_none().desc("Obtained Stack Analyses Report")
