import pytest
import time
import requests
import support.helpers as helpers
import sys
import re
import os
import json

start_time = time.time()


class Space:
    def createSpace(self, spaceName):

        # Tokens are stored in a form of "<access_token>;<refresh_token>(;<username>)"
        theToken = helpers.get_user_tokens().split(";")[0]
        print 'starting test.....'

        serverAddress = os.getenv("SERVER_ADDRESS")

        authHeader = 'Bearer {}'.format(theToken)

        headers = {'Accept': 'application/json',
                   'Authorization': authHeader,
                   'X-App': 'osio',
                   'X-Git-Provider': 'GitHub',
                   'Content-Type': 'application/json'}

        data = '{{\
            "data": {{\
                "attributes": {{\
                    "description": "This is the osioperf collaboration space",\
                    "name": "{}"\
                }},\
                "type": "spaces"\
            }}\
        }}'.format(spaceName)

        print 'making request ...'
        r = requests.post(
            '{}/api/spaces'.format(serverAddress),
            headers=headers,
            data=data
        )
        # print 'request results = {}'.format(r.content)

        try:
            respJson = r.json()
            spaceID = respJson["data"]["id"]
            return spaceID
        except ValueError:
            return None
