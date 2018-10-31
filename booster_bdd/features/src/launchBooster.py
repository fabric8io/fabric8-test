import requests
import features.src.support.helpers as helpers
import re
import os
import time

boosterLaunched = False


class LaunchBooster(object):
    def launch(self, projectName, mission="rest-http", runtime="vert.x", version="redhat",
               pipeline="maven-releasestageapproveandpromote", blankBooster="false"):

        ###############################################
        # Environment variables
        # Tokens are stored in a form of "<access_token>;<refresh_token>(;<username>)"
        theToken = helpers.get_user_tokens().split(";")[0]
        spaceId = helpers.getSpaceID()
        spaceName = helpers.getSpaceName()
        authHeader = 'Bearer {}'.format(theToken)

        gitRepo = '{}-{}'.format(spaceName, projectName)
        helpers.setGithubRepo(gitRepo)

        print('Starting test.....')

        ###############################################
        # Launch the booster
        headers = {'Accept': 'application/json',
                   'Authorization': authHeader,
                   'X-App': 'OSIO',
                   'X-Git-Provider': 'GitHub',
                   'Content-Type': 'application/x-www-form-urlencoded'}
        data = {'emptyGitRepository': blankBooster,  # true for blank booster
                'mission': mission,
                'runtime': runtime,
                'runtimeVersion': version,
                'pipeline': pipeline,
                'projectName': projectName,
                'projectVersion': '1.0.0',
                'gitRepository': gitRepo,
                'groupId': 'io.openshift.booster',
                'artifactId': projectName,
                'spacePath': spaceName,
                'space': spaceId}

        forgeApi = os.getenv("FORGE_API")

        print('Making request to launch...')

        try:
            r = requests.post(
                '{}/api/osio/launch'.format(forgeApi),
                headers=headers,
                data=data
            )
            # print('request results = {}'.format(r.text))
            helpers.printToJson('Launch booster request response', r)

            result = r.text
            if re.search('GITHUB_PUSHED', result):
                return 'Success'
            else:
                return 'Fail'

        except Exception as e:
            print('Unexpected booster launch exception found: {}'.format(e))
            print('Raw text of request/response: [{}]'.format(r.text))

    def checkCodebases(self, maxAttempts=10):
        serverUrl = os.getenv("SERVER_ADDRESS")
        spaceId = helpers.getSpaceID()
        codebasesUrl = '{}/api/spaces/{}/codebases'.format(serverUrl, spaceId)

        theToken = helpers.get_user_tokens().split(";")[0]
        authHeader = 'Bearer {}'.format(theToken)
        headers = {'Accept': 'application/json',
                   'Authorization': authHeader,
                   'X-App': 'OSIO',
                   'X-Git-Provider': 'GitHub',
                   'Content-Type': 'application/x-www-form-urlencoded'}

        global boosterLaunched
        for i in range(1, int(maxAttempts) + 1):
            r = requests.get(
                codebasesUrl,
                headers=headers
            )
            helpers.printToJson('Attempt to get codebases #{}:'.format(i), r)
            responseJson = r.json()
            data = responseJson['data']

            try:
                data2 = responseJson['data'][0]['attributes']['url']
                print('data2=' + str(data2))
            except Exception as e:
                print('Unexpected exception found: {}'.format(e))

            cbCount = len(data)
            print('Codebases found: {}'.format(cbCount))
            if cbCount > 0:
                boosterLaunched = True
                return True
            time.sleep(5)
        boosterLaunched = False
        return False
