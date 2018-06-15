import requests
import support.helpers as helpers
import os
import json

class ResetEnvironment:
    def getSpaces(self):
        serverAddress = os.getenv("WIT_API")
        osioUsername = os.getenv("OSIO_USERNAME")
        headers = {'Accept': 'application/json',
                   'X-App': 'osio',
                   'X-Git-Provider': 'GitHub',
                   'Content-Type': 'application/json'}
        r = requests.get(
            '{}/api/namedspaces/{}'.format(serverAddress, osioUsername),
            headers=headers
        )
        spaceIDs = []
        try:
            respJson = r.json()
            spaces = respJson["data"]
            for space in spaces:
                spaceIDs.append(space["id"])
            return spaceIDs
        except ValueError:
            return None

    def removeSpaces(self):

        # Tokens are stored in a form of "<access_token>;<refresh_token>(;<username>)"
        theToken = helpers.get_user_tokens().split(";")[0]
        print 'Starting removing spaces.....'

        spacesIDs = self.getSpaces()
        print 'Number of spaces before removing: {}'.format(len(spacesIDs))

        serverAddress = os.getenv("WIT_API")

        authHeader = 'Bearer {}'.format(theToken)

        headers = {'Accept': 'application/json',
                   'Authorization': authHeader,
                   'X-App': 'osio',
                   'X-Git-Provider': 'GitHub',
                   'Content-Type': 'application/json'}

        # delete spaces
        for spaceID in spacesIDs:
            print 'Deleting space {}'.format(spaceID)
            r = requests.delete(
                '{}/api/spaces/{}'.format(serverAddress, spaceID),
                headers=headers
            )
            assert r.status_code == 200
        print 'Number of spaces after removing: {}'.format(len(self.getSpaces()))
        print 'Spaces removed!'

    def cleanTenant(self):
        # Tokens are stored in a form of "<access_token>;<refresh_token>(;<username>)"
        theToken = helpers.get_user_tokens().split(";")[0]

        print 'Starting cleaning tenant.....'

        serverAddress = os.getenv("WIT_API")
        authHeader = 'Bearer {}'.format(theToken)

        headers = {'Accept': 'application/json',
                   'Authorization': authHeader,
                   'X-App': 'osio',
                   'X-Git-Provider': 'GitHub',
                   'Content-Type': 'application/json'}
        r = requests.delete(
            '{}/api/user/services'.format(serverAddress),
            headers=headers
        )
        assert r.status_code == 200
        print 'Tenant is cleaned.....'
