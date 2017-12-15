1. **Install Python 2.7.x (latest is better)**

- `sudo apt-get install python2` OR
- `sudo yum install python2` OR
- `sudo dnf install python2`

2. **Install Pytest framework**

- `sudo dnf install python2-pytest` OR
- `sudo yum install python2-pytest` OR

3. **Install Requests**

- `sudo dnf install python2-requests` OR
- `sudo yum install python2-requests` OR

4. **Install Jmespath**

- `sudo dnf install python2-jmespath` OR
- `sudo yum install python2-jmespath` OR

---
**To Run**

1. Browse to the directory pytest/ and run the command:

- sh run_me.sh "SYSTEM_UNDER_TEST" "TEST_USER_ID" "OSIO_OFFLINE_TOKEN_FOR_THE_TEST_USER"

Where,

*SYSTEM_UNDER_TEST* is the WIT/Core Target
*TEST_USER_ID* is the OSIO UserID you wish to use
*OSIO_OFFLINE_TOKEN_FOR_THE_TEST_USER* is the Offline Token for the UserID

Example:

sh run_me.sh "https://api.openshift.io" "dummyuser" "dummyuser_offline_osio_token"

**OR ...**

2. Browse to the directory pytest/src and run the command:

- pytest -s --junitxml=../pytest_junit_logs.xml --offline_token="OSIO_OFFLINE_TOKEN_FOR_THE_TEST_USER" > ../pytest_cli_logs.log

Where,

*SYSTEM_UNDER_TEST* is default set to "https://api.openshift.io"
*TEST_USER_ID* is default set to "built in OSIO test account"
*OSIO_OFFLINE_TOKEN_FOR_THE_TEST_USER* is the Offline Token for the *built in OSIO test account*

**Logging**

*pytest_junit_logs.xml* is generated in the /pytest directory. To be used for Jenkins integration
*pytest_cli_logs.log* is generated in the /pytest directory. This captures CLI logs and could be used to evaluate the run status
