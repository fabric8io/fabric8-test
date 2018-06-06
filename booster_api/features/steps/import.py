from behave import *
from src.poc2 import *
from unittest import *

@given(u'I am using the Poc2')
def step_impl(context):
    print ('Attempting to use OSIO booster service intregration POC...')
    global poc
    poc = poc2()

@when(u'I input "booster #1"')
def step_impl(context):
    global result
    result = poc.runTest('testing 1234567890')
    print ('Result = ' + result)

@then(u'I should see "Success"')
def step_impl(context):
    global expected_result
    expected_result = 'Success'
    assert (expected_result == result)

