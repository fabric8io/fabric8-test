import pytest, time
import requests
import support.helpers as helpers
import sys
import re
import os
import time
import json

start_time = time.time()

class poc_oso(object):

    def runTest(self, theString):

        ###############################################
        # Initialize variables from Environment setting

        osoUsername = os.environ.get('OSO_USERNAME')
        osoToken = os.environ.get('OSO_TOKEN')
        osoUrl = os.environ.get('OSO_CLUSTER_ADDRESS')
        authHeader = 'Bearer {}'.format(osoToken)

        print 'starting test.....'

        ###############################################
        # Find the running build pipeline, verify state transitions: New -> Running -> Complete

        headers = {'Authorization': authHeader}
        urlString = '{}/oapi/v1/namespaces/{}/builds'.format(osoUrl,osoUsername)
        retValue = 'false'

        # Verify that the newly created build has a status of 'New'
        retValue = self.buildStatus(urlString, headers, 30, 5, 'New')
        
        # Then, check for a build status of 'Running'
        if retValue == 'true':
            retValue = self.buildStatus(urlString, headers, 30, 20, 'Running')

        # Then, check for a build status of 'Running' with Promote input action
        if retValue == 'true':
            retValue = self.buildStatus(urlString, headers, 30, 20, 'Running', 'openshift.io/jenkins-pending-input-actions-json')

        # Then, promote stage to run
        if retValue == 'true':
            retValue = self.promoteBuild()

        # Then, check for a build status of 'Complete'
        if retValue == 'true':
            retValue = self.buildStatus(urlString, headers, 30, 10, 'Complete')
        
        if retValue == 'true':
            return 'Success'
        else:
            return 'Fail'


    def buildStatus(self,urlString, headers, sleepTimer, maxTries, expectedBuildStatus, expectedAnnotation=None):
        """
        Function to query builds, wait/retry for expected build status
        """
        print 'Look for build, expected build status: {}'.format(expectedBuildStatus)

        counter = 0
        requestSuccess = 'false'

        while (requestSuccess == 'false' and counter < maxTries):
            counter = counter + 1

            try:
                print 'making request ...'
                r = requests.get(urlString, headers=headers)
                respJson = r.json()
                actualBuildStatus = respJson['items'][0]['status']['phase']

                actualAnnotation = None
                if expectedAnnotation != None:
                    actualAnnotation = respJson['items'][0]['metadata']['annotations'][expectedAnnotation]

                if re.search(expectedBuildStatus , actualBuildStatus):
                    print 'Expected build status {} found'.format(expectedBuildStatus)
                    if expectedAnnotation != None:
                        if actualAnnotation != None:
                            print 'Expected annotation "{}" found'.format(expectedAnnotation)
                            requestSuccess = 'true'
                            break
                        else:
                            print 'Expected annotation "{}" not found, retrying...'.format(expectedAnnotation)
                            time.sleep(sleepTimer)
                            continue
                    requestSuccess = 'true'
                    break
                else:
                    print 'Expected build status not found, retrying - expected: "{}" actual: "{}" '.format(expectedBuildStatus, actualBuildStatus)
                    time.sleep(sleepTimer)

            except IndexError, e:
                print "Unexpected error found: " + str(e)
                print 'attempt ' + str(counter) + ' failed - retrying...'
                time.sleep(sleepTimer)

        print 'The value of requestSuccess = {}'.format(requestSuccess)

        return requestSuccess

    

    def promoteBuild(self):
        """
        Promote build from stage to run
        """
        forgeApi = os.getenv("FORGE_API")
        osoUsername = os.getenv("OSO_USERNAME")
        githubUsername = os.getenv("GITHUB_USERNAME")
        githubRepo = os.getenv("GIT_REPO")

        theToken = helpers.get_user_tokens().split(";")[0]
        headers = { "Authorization": "Bearer {}".format(theToken)}

        promoteUrl = "{}/api/openshift/services/jenkins/{}-jenkins/job/{}/job/{}/job/master/lastBuild/input/Proceed/proceedEmpty".format(
            forgeApi,
            osoUsername,
            githubUsername,
            githubRepo
        )

        print "Promote URL: {}".format(promoteUrl)
        r = requests.post(promoteUrl, headers=headers)
        if r == 200:
            return 'true'
        else:
            return 'false'
