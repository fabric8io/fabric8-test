import pytest, time
import requests
import support.helpers as helpers
import sys
import re
import os

start_time = time.time()

class poc2(object):
    def runTest(self, theString):

        ###############################################
        # Environment variables
        # 
        # Note: Pipelines = https://forge.api.openshift.io/api/services/jenkins/pipelines
        theToken = os.environ.get('THE_TOKEN')
        gitRepo = os.environ.get('GIT_REPO')
        projectName = os.environ.get('PROJECT_NAME')
        pipeline = os.environ.get('PIPELINE')
        spaceId = os.environ.get('SPACE_ID')

        print 'starting test.....'

        ###############################################
        # Return all spaces
        authHeader = 'Bearer ' + theToken
        headers = {'Accept': 'application/json', 
                   'Authorization':authHeader }
        r = requests.get('https://openshift.io/api/spaces', headers=headers)
        ## print r.text

        ###############################################
        # Import the booster
        headers = {'Accept': 'application/json', 
                   'Authorization': authHeader,  
                   'X-App': 'osio', 
                   'X-Git-Provider': 'GitHub', 
                   'Content-Type': 'application/x-www-form-urlencoded'}
        data = {'gitRepository':gitRepo, 
                'projectName':projectName, 
                'pipeline':pipeline, 
                'space':spaceId}

        print 'making request ...'
        r = requests.post('https://forge.api.openshift.io/api/osio/import', headers=headers, data=data)
        print 'request results = ' + r.text

        result = r.text
        if re.search('uuid' , result):
            return 'Success'
        else:
            return 'Fail'

