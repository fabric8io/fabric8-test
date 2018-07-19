import time
import requests
import features.src.support.helpers as helpers
import sys
import re
import os


class LaunchBooster(object):
    def launch(self, projectName, mission="rest-http", runtime="vert.x",
               pipeline="maven-releasestageapproveandpromote"):

        ###############################################
        # Environment variables
        # Tokens are stored in a form of "<access_token>;<refresh_token>(;<username>)"
        theToken = helpers.get_user_tokens().split(";")[0]
        spaceId = helpers.getSpaceID()
        spaceName = helpers.getSpaceName()
        authHeader = 'Bearer {}'.format(theToken)

        print('Starting test.....')

        ###############################################
        # Launch the booster
        headers = {'Accept': 'application/json',
                   'Authorization': authHeader,
                   'X-App': 'osio',
                   'X-Git-Provider': 'GitHub',
                   'Content-Type': 'application/x-www-form-urlencoded'}
        data = {'emptyGitRepository': 'true',
                'mission': mission,
                'runtime': runtime,
                'runtimeVersion': 'redhat',
                'pipeline': pipeline,
                'projectName': projectName,
                'projectVersion': '1.0.0',
                'gitRepository': '{}-{}'.format(spaceName, projectName),
                'groupId': 'io.openshift.booster',
                'artifactId': projectName,
                'spacePath': spaceName,
                'space': spaceId}

        forgeApi = os.getenv("FORGE_API")

        print('Making request to launch...')
        r = requests.post(
            '{}/api/osio/launch'.format(forgeApi),
            headers=headers,
            data=data
        )
        print('request results = {}'.format(r.text))

        result = r.text
        if re.search('GITHUB_PUSHED', result):
            return 'Success'
        else:
            return 'Fail'
