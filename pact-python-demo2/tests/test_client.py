"""pact test for user service client"""

import json
import logging
import os
import sys

import pytest
import requests
from requests.auth import HTTPBasicAuth

from pact_python_demo.client import StatusClient
from pact import Consumer, Like, Provider, Term

log = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


PACT_UPLOAD_URL = (
    "http://127.0.0.1/pacts/provider/UserService/consumer"
    "/UserServiceClient/version"
)
PACT_FILE = "userserviceclient-userservice.json"
PACT_BROKER_USERNAME = "pactbroker"
PACT_BROKER_PASSWORD = "pactbroker"

PACT_MOCK_HOST = 'localhost'
PACT_MOCK_PORT = 1234
PACT_DIR = os.path.dirname(os.path.realpath(__file__))

@pytest.fixture
def client():
    return StatusClient(
        'http://{host}:{port}'
        .format(host=PACT_MOCK_HOST, port=PACT_MOCK_PORT)
    )


def push_to_broker(version):
    """TODO: see if we can dynamically learn the pact file name, version, etc."""
    with open(os.path.join(PACT_DIR, PACT_FILE), 'rb') as pact_file:
        pact_file_json = json.load(pact_file)

    basic_auth = HTTPBasicAuth(PACT_BROKER_USERNAME, PACT_BROKER_PASSWORD)

    log.info("Uploading pact file to pact broker...")

    r = requests.put(
        "{}/{}".format(PACT_UPLOAD_URL, version),
        auth=basic_auth,
        json=pact_file_json
    )
    if not r.ok:
        log.error("Error uploading: %s", r.content)
        r.raise_for_status()


@pytest.fixture(scope='session')
def pact(request):
    pact = Consumer('UserServiceClient').has_pact_with(
        Provider('UserService'), host_name=PACT_MOCK_HOST, port=PACT_MOCK_PORT,
        pact_dir=PACT_DIR)
    pact.start_service()
    yield pact
    pact.stop_service()

    version = request.config.getoption('--publish-pact')
    if not request.node.testsfailed and version:
        push_to_broker(version)


def test_get_status(pact, client):
    #expected = {
    #    'name': 'UserA',
    #    'id': Term(
    #        r'^[a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12}\Z',
    #        '00000000-0000-4000-a000-000000000000'
    #    ),
    #    'created_on': Term(
    #        r'\d+-\d+-\d+T\d+:\d+:\d+',
    #        '2016-12-15T20:16:01'
    #    ),
    #    'admin': False
    #}
    expected = {
        'buildTime': Term(
            r'\d+-\d+-\d+T\d+:\d+:\d+Z',
            '2018-09-10T11:08:26Z'
        ),
        'commit': Term(
            r'^[a-f0-9]+-dirty',
            '164762f67a3a7634fa4ee1e8bb55c458281803c7-dirty'
        ),
        'startTime': Term(
            r'\d+-\d+-\d+T\d+:\d+:\d+Z',
            '2018-09-10T11:08:26Z'
        )
    }

    (pact
     .given('status exists')
     .upon_receiving('a request for status')
     .with_request('get', '/status')
     .will_respond_with(200, body=Like(expected)))

    with pact:
        result = client.get_status('status')

    # assert something with the result, for ex, did I process 'result' properly?
    # or was I able to deserialize correctly? etc.


