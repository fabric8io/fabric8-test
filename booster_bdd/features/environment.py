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


def after_all(_context):
    """Gather all logs."""
    if helpers.is_user_logged_in():
        try:
            print("Gathering project Jenkins logs.")
            jenkinsOutput = check_output(["./oc-get-project-logs.sh",
                                          _context.username,
                                          _context.password,
                                          "jenkins",
                                          helpers.get_user_tokens().split(";")[0]
                                          ],
                                         stderr=STDOUT)
            save_output_to_file(jenkinsOutput.decode("utf-8"),
                                "{}/project-logs-jenkins.log".format(helpers.report_dir()))
        except CalledProcessError as e:
            print("Error executing: {}".format(e))

        try:
            print("Gathering project Che logs.")
            cheOutput = check_output(["./oc-get-project-logs.sh",
                                      _context.username,
                                      _context.password,
                                      "che",
                                      helpers.get_user_tokens().split(";")[0]
                                      ],
                                     stderr=STDOUT)
            save_output_to_file(cheOutput.decode("utf-8"),
                                "{}/project-logs-che.log".format(helpers.report_dir()))
        except CalledProcessError as e:
            print("Error executing: {}".format(e))


def save_output_to_file(output, fileName):
    f = open(fileName, "w")
    f.write(output)
