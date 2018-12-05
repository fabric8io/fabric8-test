"""Module with code to be run before and after certain events during the testing."""
import os
from src.support import helpers
from subprocess import check_output, CalledProcessError, STDOUT


def before_all(_context):
    """Perform the setup before the first event."""
    if not helpers.is_user_logged_in():
        username = os.getenv("OSIO_USERNAME")
        password = os.getenv("OSIO_PASSWORD")
        assert username is not None
        assert password is not None
        assert username != ""
        assert password != ""
        print("Loggin user {} in...".format(username))
        helpers.login_user(username, password)
        _context.username = username
        _context.password = password
