import time
import requests
from features.src.support import helpers
import os

start_time = time.time()


class Space:
    def createSpace(self, spaceName):

        # Tokens are stored in a form of "<access_token>;<refresh_token>(;<username>)"
        theToken = helpers.get_user_tokens().split(";")[0]
        print('Starting test.....')

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

        print('Making request to create a new space "{}"...'.format(spaceName))

        try:
            r = requests.post(
                '{}/api/spaces'.format(serverAddress),
                headers=headers,
                data=data
            )
            # print 'request results = {}'.format(r.content)
            try:
                respJson = r.json()
                spaceID = respJson["data"]["id"]
                print('The spaceID is: {}'.format(spaceID))
                return spaceID
            except ValueError:
                return None

        except Exception as e:
            print('Unexpected space creation exception found: {}'.format(e))
            print('Raw text of request/response: [{}]'.format(r.text))
