import time
import requests
from features.src.support import helpers
import os
import json

start_time = time.time()

cheApiAddress = os.getenv("CHE_API")
githubRepoUrl = os.getenv("GIT_REPO_URL")


class Workspace:

    # Query the deleted workspace - should not be found
    def workspaceDeleteStatus(self, workspaceId):
        print('Starting check for deleted workspace status.....')

        theToken = helpers.get_user_tokens().split(";")[0]
        authHeader = 'Bearer {}'.format(theToken)

        headers = {'Accept': 'application/json',
                   'Authorization': authHeader,
                   'X-App': 'osio',
                   'X-Git-Provider': 'GitHub',
                   'Content-Type': 'application/json'}

        try:
            r = requests.get(
               '{}/api/workspace/{}'.format(cheApiAddress, workspaceId),
               headers=headers
            )
            respJson = r.json()
            # print (respJson)
            exceptionMessage = respJson["message"]
            print('The deleted workspace exception messsage is {}'.format(exceptionMessage))

            testString = "Workspace with id '" + workspaceId + "' doesn't exist"
            if testString in exceptionMessage:
                return True
            else:
                return False

        except Exception as e:
            print('Unexpected workspace get status found: {}'.format(e))
            print('Raw text of request/response: [{}]'.format(r.text))

        return False

    # Query the selected workspace - wait until the expected status is seen

    def workspaceStatus(self, workspaceId, maxAttempts, expectedStatus):
        print('Starting check for workspace status.....')

        theToken = helpers.get_user_tokens().split(";")[0]
        authHeader = 'Bearer {}'.format(theToken)

        headers = {'Accept': 'application/json',
                   'Authorization': authHeader,
                   'X-App': 'osio',
                   'X-Git-Provider': 'GitHub',
                   'Content-Type': 'application/json'}

        for i in range(1, int(maxAttempts) + 1):
            time.sleep(10)

            try:
                r = requests.get(
                   '{}/api/workspace/{}'.format(cheApiAddress, workspaceId),
                   headers=headers
                )
                respJson = r.json()
                # print (respJson)
                # Commented out as this displays the machine token:
                # helpers.printToJson('Query the Che workspace status request response', r)

                workspaceStatus = respJson["status"]
                print('The new workspace status is: {}, looking for {}'.format(
                    workspaceStatus, expectedStatus))
                if workspaceStatus == expectedStatus:

                    return True

            except Exception as e:
                print('Unexpected workspace get status found: {}'.format(e))
                print('Raw text of request/response: [{}]'.format(r.text))

        return False

    # Stop the selected workspace

    def workspaceStop(self, workspaceId):
        print('Stopping workspace.....')

        theToken = helpers.get_user_tokens().split(";")[0]
        authHeader = 'Bearer {}'.format(theToken)

        headers = {'Accept': 'application/json',
                   'Authorization': authHeader,
                   'X-App': 'osio',
                   'X-Git-Provider': 'GitHub',
                   'Content-Type': 'application/json'}
        try:
            r = requests.delete(
               '{}/api/workspace/{}/runtime'.format(cheApiAddress, workspaceId),
               headers=headers
            )
            # respJson = r.json()
            # print (respJson)
            helpers.printToJson('Stop the Che workspace request response', r)

        except Exception as e:
            print('Unexpected workspace stop status found: {}'.format(e))
            print('Raw text of request/response: [{}]'.format(r.text))

    # Stop the selected workspace

    def workspaceDelete(self, workspaceId):
        print('Deleting workspace.....')

        theToken = helpers.get_user_tokens().split(";")[0]
        authHeader = 'Bearer {}'.format(theToken)

        headers = {'Accept': 'application/json',
                   'Authorization': authHeader,
                   'X-App': 'osio',
                   'X-Git-Provider': 'GitHub',
                   'Content-Type': 'application/json'}
        try:
            r = requests.delete(
               '{}/api/workspace/{}'.format(cheApiAddress, workspaceId),
               headers=headers
            )
            # respJson = r.json()
            # print (respJson)
            helpers.printToJson('Delete the Che workspace request response', r)

        except Exception as e:
            print('Unexpected workspace delete status found: {}'.format(e))
            print('Raw text of request/response: [{}]'.format(r.text))

    def createWorkspace(self, workspaceName):

        # Tokens are stored in a form of "<access_token>;<refresh_token>(;<username>)"
        theToken = helpers.get_user_tokens().split(";")[0]
        print('Creating space now.....')

        # serverAddress = 'https://che.openshift.io/api/workspace'

        authHeader = 'Bearer {}'.format(theToken)

        headers = {'Accept': 'application/json',
                   'Authorization': authHeader,
                   'X-App': 'osio',
                   'X-Git-Provider': 'GitHub',
                   'Content-Type': 'application/json'}

        # Extended JSON from Ilya expressed as string
        payloadString2 = '{\
              "projects": [\
                {\
                  "projectType": "maven",\
                  "projects": [],\
                          "commands": [\
                            {\
                              "commandLine": "mvn -f ${current.project.path} clean install",\
                              "name": "console-java-simple:build",\
                      "type": "mvn",\
                      "attributes": {\
                        "previewUrl": "",\
                        "goal": "Build"\
                      }\
                    },\
                    {\
                      "commandLine": "mvn -f ${current.project.path} clean install NEW_LINE java -jar ${current.project.path}/target/*.jar",\
                      "name": "console-java-simple:run",\
                      "type": "mvn",\
                      "attributes": {\
                        "previewUrl": "",\
                        "goal": "Run"\
                      }\
                    }\
                  ],\
                  "mixins": [],\
                  "problems": [],\
                  "links": [],\
                  "category": "Samples",\
                  "options": {},\
                  "source": {\
                    "location": "GITHUB_REPO_NAME",\
                    "type": "git",\
                    "parameters": {}\
                  },\
                  "description": "A hello world Java application.",\
                  "displayName": "console-java-simple",\
                  "tags": [\
                    "java",\
                    "maven"\
                  ],\
                  "name": "console-java-simple",\
                  "path": "/console-java-simple",\
                  "attributes": {\
                    "language": [\
                       "java"\
                    ]\
                  },\
                  "type": "maven"\
                }\
              ],\
              "commands": [\
                {\
                  "commandLine": "mvn clean install -f ${current.project.path}",\
                  "name": "build",\
                  "type": "mvn",\
                  "attributes": {\
                    "goal": "Build",\
                    "previewUrl": ""\
                  }\
                },\
                {\
                  "commandLine": "mvn -f ${current.project.path} clean install",\
                  "name": "console-java-simple:build",\
                  "type": "mvn",\
                  "attributes": {\
                    "previewUrl": "",\
                    "goal": "Build"\
                  }\
                },\
               {\
                  "commandLine": "mvn -f ${current.project.path} clean install NEW_LINE java -jar ${current.project.path}/target/*.jar",\
                  "name": "console-java-simple:run",\
                  "type": "mvn",\
                  "attributes": {\
                    "previewUrl": "",\
                    "goal": "Run"\
                  }\
                }\
              ],\
              "defaultEnv": "default",\
              "environments": {\
                "default": {\
                  "recipe": {\
                    "type": "dockerimage",\
                    "content": "registry.devshift.net/che/centos_jdk8"\
                  },\
                  "machines": {\
                    "dev-machine": {\
                      "volumes": {},\
                      "servers": {\
                        "tomcat8": {\
                          "attributes": {},\
                          "protocol": "http",\
                          "port": "8080"\
                        }\
                      },\
                      "installers": [\
                        "com.redhat.oc-login",\
                        "com.redhat.bayesian.lsp",\
                        "org.eclipse.che.ws-agent",\
                        "org.eclipse.che.terminal",\
                        "org.eclipse.che.exec"\
                      ],\
                      "env": {},\
                      "attributes": {\
                        "memoryLimitBytes": 2147483648\
                      }\
                    }\
                  }\
                }\
              },\
              "name": "WORKSPACE_NAME",\
              "attributes": {},\
              "links": []\
        }'

        # Replace strings in the payloadString

        # Replace NEW_LINE with \n (json.loads fails on \n)
        tempString1 = payloadString2.replace("NEW_LINE", "\\n")
        # print tempString1

        # Replace workspace name placeholder with actual intended workspace name
        tempString2 = tempString1.replace("WORKSPACE_NAME", workspaceName)
        # print tempString2

        # Replace github repo name placeholder
        tempString3 = tempString2.replace("GITHUB_REPO_NAME", githubRepoUrl)
        # print (tempString3)

        d = json.loads(tempString3)
        # print (d)
        print('Making request to create a new workspace "{}"...'.format(workspaceName))

        try:
            r = requests.post(
                '{}/api/workspace?start-after-create=true'.format(cheApiAddress),
                headers=headers,
                json=d
            )
            # print 'request results = {}'.format(r.content)
            try:
                respJson = r.json()
                # print(respJson)
                helpers.printToJson('Create the Che workspace request response', r)

                workspaceUrl = respJson["links"]["ide"]
                print('The new workspace name is: {}'.format(workspaceUrl))

                workspaceId = respJson["id"]
                print('The new workspace id is: {}'.format(workspaceId))

                return workspaceId
            except ValueError:
                return None

        except Exception as e:
            print('Unexpected workspace creation exception found: {}'.format(e))
            print('Raw text of request/response: [{}]'.format(r.text))
