import pytest, time
import requests
import support.helpers as helpers
import sys
import re
import os
import time

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
        retValue = self.buildStatus(30, 5, 'New', urlString, headers)
        
        # Then, check for a build status of 'Running'
        if retValue == 'true':
            retValue = self.buildStatus(30, 20, 'Running', urlString, headers)

        # Then, check for a build status of 'Complete'
        if retValue == 'true':
            retValue = self.buildStatus(30, 10, 'Complete', urlString, headers)
        
        if retValue == 'true':
            return 'Success'
        else:
            return 'Fail'


    ###############################################
    # Function to query builds, wait/retry for expected build status

    def buildStatus(self, sleepTimer, maxTries, expectedBuildStatus, urlString, headers):
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
  
                if re.search(expectedBuildStatus , actualBuildStatus):
                    print 'Expected build status {} found'.format(expectedBuildStatus)
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


