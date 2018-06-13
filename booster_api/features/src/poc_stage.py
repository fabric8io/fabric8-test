import pytest, time
import requests
import support.helpers as helpers
import sys
import re
import os
import time

start_time = time.time()

class poc_stage(object):

    def runTest(self, theString):

        ###############################################
        # Initialize variables from Environment setting

        osoUsername = os.environ.get('OSO_USERNAME')
        projectName = os.environ.get('PROJECT_NAME')
        stageServer = os.environ.get('STAGE_SERVER')

        # Example staged app endpoint:
        # http://test123-ldimaggi-stage.8a09.starter-us-east-2.openshiftapps.com

        urlString = 'http://{}-{}-{}'.format(projectName, osoUsername, stageServer)

        print 'starting test.....'

        r = requests.get(urlString)
        print 'request results = {}'.format(r.text)

        result = r.text
        if re.search('Using the greeting service' , result):
            return 'Success'
        else:
            return 'Fail'




