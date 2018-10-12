import requests
import features.src.support.helpers as helpers
import os
import time
from urllib.parse import urljoin

boosterLaunched = False

class StackAnalyses(object):

    # Obtain the key to use to access the stack analyses information 
    def getReportKey (self, codebaseUrl):
        print('Getting Stack Analyses report ID.....')

        theToken = helpers.get_user_tokens().split(";")[0]
        authHeader = 'Bearer {}'.format(theToken)

        # TODO - Convert to environment variables
        _url = 'https://recommender.api.openshift.io'
        _endpoint = '/api/v1/stack-analyses'

        headers = {'Accept': 'application/json',
                   'Authorization': authHeader,
                   'X-App': 'osio',
                   'X-Git-Provider': 'GitHub',
                   'Content-Type': 'application/x-www-form-urlencoded'}

        # Remove the ".git" suffix from the URL
        # print ('the target URL is:' + codebaseUrl)
        if shortenedUrl.endswith(".git"):
            shortenedUrl = codebaseUrl[:-4]
        # print ('the shortened URL is:' + shortenedUrl)

        # TODO - The call is failing to all repos other than booster repos
        #shortenedUrl = 'https://github.com/wildfly-swarm-openshiftio-boosters/wfswarm-rest-http'

        payload = {
            'github_url': shortenedUrl,
            'source': 'osio',
            'github_ref': 13
        }

        try:
            r = requests.post(urljoin(_url, _endpoint),
                        headers=headers, data=payload)

            # print (r.text)
            respJson = r.json()
            helpers.printToJson('Obtain the stack analyses key', r)
            theID = respJson["id"]
            print ('Stack analyses key  {}'.format(theID))
            return theID

        except Exception as e:
            print('Unexpected stack analyses key: {}'.format(e))
            print('Raw text of request/response: [{}]'.format(r.text))


    # Given a stack analyses key value - obtain the report
    def getStackReport (self, reportKey):

        print('Getting Stack Analyses report.....')

        theToken = helpers.get_user_tokens().split(";")[0]
        authHeader = 'Bearer {}'.format(theToken)

        # TODO - Convert to environment variables
        _url = 'https://recommender.api.openshift.io'
        _endpoint = '/api/v1/stack-analyses'

        headers = {'Accept': 'application/json',
                   'Authorization': authHeader,
                   'X-App': 'osio',
                   'X-Git-Provider': 'GitHub',
                   'Content-Type': 'application/x-www-form-urlencoded'}

        try:
            r = requests.get(urljoin(_url, _endpoint + '/' + reportKey), headers=headers)
            print (r.text)
            helpers.printToJson('Obtain the stack analyses report', r)
            return r.text

        except Exception as e:
            print('Unexpected stack analyses report: {}'.format(e))
            print('Raw text of request/response: [{}]'.format(r.text))



    # Obtain the URL of a code base's github repo - assuming only 1 codebase
    def getCodebaseUrl(self, maxAttempts=10):
        serverUrl = os.getenv("SERVER_ADDRESS")
        spaceId = helpers.getSpaceID()
        codebasesUrl = '{}/api/spaces/{}/codebases'.format(serverUrl, spaceId)

        theToken = helpers.get_user_tokens().split(";")[0]
        authHeader = 'Bearer {}'.format(theToken)
        headers = {'Accept': 'application/json',
                   'Authorization': authHeader,
                   'X-App': 'osio',
                   'X-Git-Provider': 'GitHub',
                   'Content-Type': 'application/x-www-form-urlencoded'}

        for i in range(1, 2):
            r = requests.get(
                codebasesUrl,
                headers=headers
            )
            helpers.printToJson('Attempt to get codebases #{}:'.format(i), r)
            responseJson = r.json()
            data = responseJson['data'][0]['attributes']['url']
            time.sleep(5)
        return data
        
