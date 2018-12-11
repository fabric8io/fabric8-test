import requests
import features.src.support.helpers as helpers
import os

from pyshould import should


class ResetEnvironment:
    def getSpaces(self):
        serverAddress = os.getenv("WIT_API")
        osioUsername = os.getenv("OSIO_USERNAME")
        headers = {'Accept': 'application/json',
                   'X-App': 'OSIO',
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
        print('Starting removing spaces.....')

        spacesIDs = self.getSpaces()
        print('Number of spaces before removing: {}'.format(len(spacesIDs)))

        serverAddress = os.getenv("WIT_API")
        cheAddress = os.getenv("CHE_API")

        authHeader = 'Bearer {}'.format(theToken)

        headers = {'Accept': 'application/json',
                   'Authorization': authHeader,
                   'X-App': 'OSIO',
                   'X-Git-Provider': 'GitHub',
                   'Content-Type': 'application/json'}

        # delete spaces
        for spaceID in spacesIDs:
            print('Looking for codebases of space: {}'.format(spaceID))
            r = requests.get(
                '{}/api/spaces/{}/codebases'.format(serverAddress, spaceID),
                headers=headers
            )
            r.status_code | should.be(200).desc(
                "Status code for response to get space codebases is 200.")
            codebases = r.json()["data"]
            if codebases is not None:
                for cb in codebases:
                    cbID = cb["id"]
                    print('Looking for workspaces of codebase: {}'.format(cbID))
                    r = requests.get(
                        '{}/api/codebases/{}/workspaces'.format(serverAddress, cbID),
                        headers=headers
                    )
                    r.status_code | should.be(200).desc(
                        "Status code for response to get codebase workspaces is 200.")
                    workspaces = r.json()["data"]
                    if workspaces is not None:
                        for ws in workspaces:
                            wsID = ws["attributes"]["id"]
                            wsName = ws["attributes"]["name"]
                            print('Deleting workspace: {} ({})'.format(wsID, wsName))
                            r = requests.delete(
                                '{}/api/workspace/{}'.format(cheAddress, wsID),
                                headers=headers
                            )
                            r.status_code | should.be(204).desc(
                                "Status code for response to delete workspace is 204.")
                    else:
                        print("No workspaces found.")
            else:
                print("No codebases found.")

            print('Deleting space {}'.format(spaceID))
            r = requests.delete(
                '{}/api/spaces/{}'.format(serverAddress, spaceID),
                headers=headers
            )
            r.status_code | should.be(200).desc("Status code for response to delete space is 200.")

            if r.status_code != 200:
                print(
                    "ERROR - Request to delete space {} failed - error code = {}"
                    .format(spaceID, r.status_code)
                )

        print('Number of spaces after removing: {}'.format(len(self.getSpaces())))
        print('Spaces removed!')

    def cleanTenant(self):
        # Tokens are stored in a form of "<access_token>;<refresh_token>(;<username>)"
        theToken = helpers.get_user_tokens().split(";")[0]

        print('Starting cleaning tenant.....')

        serverAddress = os.getenv("WIT_API")
        authHeader = 'Bearer {}'.format(theToken)

        headers = {'Accept': 'application/json',
                   'Authorization': authHeader,
                   'X-App': 'OSIO',
                   'X-Git-Provider': 'GitHub',
                   'Content-Type': 'application/json'}
        r = requests.delete(
            '{}/api/user/services'.format(serverAddress),
            headers=headers
        )
        assert r.status_code == 200
        r = requests.patch(
            '{}/api/user/services'.format(serverAddress),
            headers=headers
        )
        assert r.status_code == 200
        print('Tenant is cleaned.....')
