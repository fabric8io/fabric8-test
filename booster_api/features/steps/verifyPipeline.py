from behave import *
from src.poc_oso import *
from unittest import *

@given(u'I have imported a booster')
def step_impl(context):
    print ('Attempting to use query for running Pipeline...')
    global poc
    poc = poc_oso()

@when(u'I input query a pipeline\'s ID')
def step_impl(context):
    global result
    result = poc.runTest('testing 1234567890')
    print ('Result = {}'.format(result))

@then(u'I should see the pipeline status as "Running"')
def step_impl(context):
    global expected_result
    expected_result = 'Success'
    assert (expected_result == result)

