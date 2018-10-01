"""Module with code to be run before and after certain events during the testing."""
import os
from src.support import helpers


def before_all(_context):
    """Perform the setup before the first event."""
    if not helpers.is_user_logged_in():
        username = os.getenv("OSIO_USERNAME")
        password = os.getenv("OSIO_PASSWORD")
        assert username != ""
        assert password != ""
        print("Loggin user {} in...".format(username))
        helpers.login_user(username, password)
