import time
import requests
import features.src.support.helpers as helpers
import re
import os

start_time = time.time()

pipelineVerified = False


class Pipeline(object):

    def __init__(self):
        ###############################################
        # Initialize variables from Environment setting

        self.osoUsername = os.environ.get('OSO_USERNAME')
        self.osoToken = os.environ.get('OSO_TOKEN')
        self.osoUrl = os.environ.get('OSO_CLUSTER_ADDRESS')
        self.authHeader = 'Bearer {}'.format(self.osoToken)

        ###############################################
        # Find the running build pipeline, verify state transitions:
        #   New -> Running -> Promote -> Complete

        self.headers = {'Authorization': self.authHeader}
        self.urlString = '{}/oapi/v1/namespaces/{}/builds'.format(self.osoUrl, self.osoUsername)
        print('Pipeline URL = {}'.format(self.urlString))

    def buildStatus(self, sleepTimer, maxTries, expectedBuildStatus,
                    expectedAnnotation=None):
        """
        Function to query builds, wait/retry for expected build status
        """
        print('Look for build, expected build status: {}'.format(expectedBuildStatus))

        counter = 0
        requestFailed = True

        while (requestFailed and (counter < maxTries)):
            counter = counter + 1

            try:
                print('Making request to check for the build status...')
                r = requests.get(self.urlString, headers=self.headers)

                helpers.printToJson('Build status response', r)

                respJson = r.json()
                actualBuildStatus = respJson['items'][0]['status']['phase']

                expectedAnnotationFound = False
                if expectedAnnotation is not None:
                    expectedAnnotationFound = (
                        expectedAnnotation in respJson['items'][0]['metadata']['annotations']
                    )

                if re.search(expectedBuildStatus, actualBuildStatus):
                    print('Expected build status {} found'.format(expectedBuildStatus))
                    if expectedAnnotation is not None:
                        if expectedAnnotationFound:
                            print('Expected annotation "{}" found'.format(expectedAnnotation))
                            requestFailed = False
                            break
                        else:
                            print(
                                'Expected annotation "{}" not found, retrying...'
                                .format(expectedAnnotation)
                            )
                            time.sleep(sleepTimer)
                            continue
                    requestFailed = False
                    break
                else:
                    print('Expected build status not found, retrying - expected: "{}" actual: "{}" '
                          .format(expectedBuildStatus, actualBuildStatus)
                          )
                    time.sleep(sleepTimer)

            except IndexError as e:
                print('Unexpected error found: {}'.format(e))
                print('attempt {} failed - retrying...'.format(counter))
                time.sleep(sleepTimer)

        # print('The value of requestFailed = {}'.format(requestFailed))

        return not requestFailed

    def promoteBuild(self):
        """
        Promote build from stage to run
        """
        forgeApi = os.getenv("FORGE_API")
        osoUsername = os.getenv("OSO_USERNAME")
        githubUsername = os.getenv("GITHUB_USERNAME")
        githubRepo = helpers.getGithubRepo()

        theToken = helpers.get_user_tokens().split(";")[0]
        headers = {"Authorization": "Bearer {}".format(theToken)}

        promoteUrl = "{}/api/openshift/services/jenkins/{}-jenkins/job/{}/job/{}/job/{}".format(
            forgeApi,
            osoUsername,
            githubUsername,
            githubRepo,
            "master/lastBuild/input/Proceed/proceedEmpty"
        )

        print("Promote URL: {}".format(promoteUrl))
        print("Making request to promote build from Stage to Run...")

        try:
            r = requests.post(promoteUrl, headers=headers)
            helpers.printToJson('Promote response', r)

            if r.status_code == 200:
                print("SUCCESS - Successful promotion")
                return True
            else:
                print("ERROR - Request failed to promote - error code = {}".format(r.status_code))
                return False

        except Exception as e:
            print('Unexpected booster promote exception found: {}'.format(e))
            print('Raw text of request/response: [{}]'.format(r.text))
