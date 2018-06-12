import pytest, time
import requests
import support.helpers as helpers
import sys
import re
import os
import json

start_time = time.time()

class Space:
    def createSpace(self, spaceName):

        theToken = helpers.get_user_tokens().split(";")[0] # Tokens are stored in a form of "<access_token>;<refresh_token>(;<username>)"
        print 'starting test.....'

        serverAddress = os.getenv("SERVER_ADDRESS")

        authHeader = 'Bearer ' + theToken

        headers = {'Accept': 'application/json',
                   'Authorization': authHeader,
                   'X-App': 'osio',
                   'X-Git-Provider': 'GitHub',
                   'Content-Type': 'application/json'}

        data = '{\
            "data": {\
                "attributes": {\
                    "description": "This is the osioperf collaboration space",\
                    "name": "' + spaceName + '"\
                },\
                "type": "spaces"\
            }\
        }'


        print 'making request ...'
        r = requests.post(serverAddress + '/api/spaces', headers=headers, data=data)
        print 'request results = ' + r.content

        try:
            respJson = r.json()
            spaceID = respJson["data"]["id"]
            return spaceID
        except ValueError:
            return None

