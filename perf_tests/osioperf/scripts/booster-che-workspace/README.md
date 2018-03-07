# Openshift.io - Workshop Demo User Scenario Performance Evaluation
These tests are intended to measure performance of OSIO UI for users performing a given scenario such as login, click through the OSIO UI etc.

## Environment
The tested system is the Openshift.io.
The clients to the tested server are deployed on the client nodes 
of the OsioPerf Lab.

## Test setup
The test in the environment is executed with 10 tested OSIO user accounts that has a GitHub account linked.
The user accounts are evenly spread between 10 individual client nodes of the OsioPerf Lab
from whose the requests are sent via 100s simultaneous clients (=simulated users). Each simulated user waits 1 second
before starting another iteration.

## Scenario (`booster-che-workspace`)
The scenario is logically divided into the following phases:
 * Login user
 * Create a new space
 * Create a quick-start project
 * Create a Che workspace and work with the booster
 * Remove the space

### Login user (`login`)
The following steps are performed in sequence and a time to finish is measured for each step:
 * (`open-start-page`) Open the start page (`https://openshift.io`) and wait for the `LOG IN` button to be clickable.
 * (`open-login-page`) Click on the `LOG IN` button and wait for the login page to load.
 * (`login`) Fill in username and password, click on the `LOG IN` button and wait until the page is redirected to `_home` page.

### Create new space (`create_space`)
The following steps are performed in sequence and a time to finish is measured for each step:
 * (`new-button`) Wait for the `Create a Space` button to be clickable.
 * (`fill-name`) Wait for the new space name text field to be ready.
 * (`create-button`) Wait for the name of the new space to be verified and the `Create` button to be clickable.
 * (`nothanks-button`) Wait for the new space to be created and a dialog for the Quick start to appear.

### Create a quick-start project (`quickstart`)
The following steps are performed in sequence and a time to finish is measured for each step:
 * (`add-codebase-button`) Click on the `No thanks...` button and wait for the `Add Codebase` button on the space page to be clickable.
 * (`forge-quickstart-button`) Click on the `Add Codebase` button and wait for the quicksart wizard to appear.
 * (`forge-1A-app-button`) Click on the `Create a new Quickstart project` button and wait for the next wizard step.
 * (`forge-1A-next-button`) Click on the `Vert.x HTTP Booster`, wait for the validation and the `Next >` button to be clickable.
 * (`forge-1B-groupId`) Click on the `Next >` button and wait for the `Group Id` input box.
 * (`forge-1B-next-button`) Add `.qa.performance` string at the end of the content of the `Group Id` and wait for the validation and the `Next >` button to be clickable.
 * (`forge-2A-next-button`) Click on the `Next >` button and wait for the `Next >` button from the next step is clickable.
 * (`forge-2B-finish-button`) Wait for the validation and the `Finish >` button to be clickable.
 * (`forge-3A-ok-button`) Click on the `Finish` button and wait for the `Ok` button from the next step to be clickable.
 * (`pipeline-title`) Click on the `Ok` button and wait for the `Pipelines` title on the space page to be clickable.

### Work with booster in Che (`che_workspace`)
The following steps are performed in sequence and a time to finish is measured for each step:
 * (`codebases-page`) Navigate to space page, click on the `Codebases` title and wait for the `Create a workspace` button to be clickable.
 * (`open-window`) Wait for the second window with Che to open. 
 * (`workspace-created`) Wait for the project tree to appear in Project Explorer.
 * (`terminal-maximized`) Double-click on the `Terminal` tab on the bottom of the Che and wait for the terminal to maximize.
 * (`maven-build`) Click into `Terminal` window, pass and run `mvn clean install -Popenshift,openshift-it` command and wait until the Maven build completes. 
 * (`back-to-space`) Switch back to the first window (with space page).

### Remove the space (`remove_space`)
The following steps are performed in sequence and a time to finish is measured for each step:
 * (`my-spaces-page`) Navigate to the `/_myspaces` page and wait for the `Filter by Name` input box to be clickable.
 * (`filter-by-name`) Fill the name of the space into the `Filter by Name` input box, press `Enter` and wait for the `Active Filter:`
 * (`removed`) Click on the tree-dots-space-menu, click on the `Remove Space` button, click on the `Remove` button and wait for the `Create Space` button to be clickable.

## How to run the tests locally
By default the load test executed by Locust tool runs in a distributed mode, i.e. uses remote access
to the Master and Slave nodes via SSH to start Locust process on those nodes to load the tested system
from a different places.

However, it is possible to switch the test to the local execution. To do that simply set the environment
variable `RUN_LOCALLY=true`. The easiest way is to uncomment the respective line in `_setenv.sh` file.

To run the test, configure the test in `_setenv.sh` file and run the `run.sh` script.
