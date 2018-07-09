from behave import *
from src.run import *
from unittest import *


@given(u'I have verified a booster\'s pipeline has had its deployment to stage verified')
def step_impl(context):
    print('Attempting to use query for running Pipeline...')
    global run
    run = Run()


@when(u'I query a pipeline\'s run endpoint')
def step_impl(context):
    global result
    result = run.runTest('testing 1234567890')
    print('Result = {}'.format(result))


@then(u'I should see the deployed app running on run')
def step_impl(context):
    global expected_result
    expected_result = 'Success'
    assert (expected_result == result)
