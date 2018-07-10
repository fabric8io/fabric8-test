import os
from behave import fixture
from src.support import helpers


def before_all(context):
    if not helpers.is_user_logged_in():
        username = os.getenv("OSIO_USERNAME")
        password = os.getenv("OSIO_PASSWORD")
        assert username != ""
        assert password != ""
        print("Loggin user {} in...".format(username))
        helpers.login_user(username, password)
