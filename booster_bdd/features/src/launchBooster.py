import requests
import features.src.support.helpers as helpers
import re
import os

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
                   'X-App': 'osio',
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
        r = requests.post(
            '{}/api/osio/launch'.format(forgeApi),
            headers=headers,
            data=data
        )
        # print('request results = {}'.format(r.text))
        helpers.printToJson('Launch booster request response', r)

        result = r.text
        global boosterLaunched
        if re.search('GITHUB_PUSHED', result):
            boosterLaunched = True
            return 'Success'
        else:
            boosterLaunched = False
            return 'Fail'
