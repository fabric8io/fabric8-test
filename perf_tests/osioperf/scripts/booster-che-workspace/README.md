# Openshift.io - Workshop Demo User Scenario Performance Evaluation
These tests are intended to measure performance of OSIO UI for users performing a given scenario such as login, click through the OSIO UI etc.

## Environment
The tested system is the Openshift.io.
The clients to the tested server are deployed on the client nodes 
of the OsioPerf Lab.

## Test setup
The test in the environment is executed with up to 500 tested OSIO user accounts that has a single GitHub account linked.
The user accounts are evenly spread between 10 individual client nodes of the OsioPerf Lab
from whose the requests are sent via 100s simultaneous clients (=simulated users). Each simulated user waits 1 second
before starting another iteration.

## Scenario (`booster-che-workspace`)
The scenario is logically divided into the following phases:
 * Login user
 * First time setup
 * Create a new space
 * Create a quick-start project
 * Create a Che workspace and work with the booster
 * Go through a pipeline build
 * Remove the space

### Login user (`login`)
The following steps are performed in sequence and a time to finish is measured for each step:
 * (`open-start-page`) Open the start page (`https://openshift.io`) and wait for the `LOG IN` button to be clickable.
 * (`open-login-page`) Click on the `LOG IN` button and wait for the login page to load.
 * (`login`) Fill in username and password, click on the `LOG IN` button and wait until the page is redirected to `_home` page.

### First time setup (`setup`)
The following steps are performed in sequence and a time to finish is measured for each step:
 * (`reset-environment`) Open the user's profile page, click on the `Update Profile` button, click on the `Reset Environment` button, click on the `Erase My OpenShift.io Environment` button, fill in the username, click on the `I understand my actions - erase my environment` button, wait for the alert message to appear.

### Create new space via ngx launcher (`create_space_ngx`)
The following steps are performed in sequence and a time to finish is measured for each step:
 * Start at the main dashboard page.
 * (`new-button`) Wait for the `Create a Space` button to be clickable and click on it.
 * (`new-create-space-experience`) Wait for the `New Create Space Experience` link to be clickable and click on it.
 * (`create-space-button`) Wait for the new space name text field to be ready, fill in the new space name and wait for the name of the new space to be verified and the `Ok` button to be clickable.
 * (`cancel`) Wait for the new space to be created and a dialog for the creating a new application with the canceling `X` button to be displayed.
 * (`space-page-open`) Click on the `X` button and wait for the Space dashboard page to be loaded.

### Create a quick-start project (`create-quickstart-ngx`)
The following steps are performed in sequence and a time to finish is measured for each step:
 * Start on the Space dashboard page.
 * (`add-to-space-button`) Wait for the button and wait for the `Add To Space` button to be clickable.
 * (`new-launcher-experience`) Wait for a dialog for new application to be displayed and the `Try our new Getting Started experience` link to be clickable.
 * (`app-name`) Click on the `Try our new Getting Started experience` link, fill in the application name equals to the space name and wait for the `Create a new codebase` card to be clickable.
 * (`continue-button`) Click on the `Create a new codebase` card and wait for the `Continue` button to be clickable.
 * (`launcher-page-open`) Click on the `Continue` button and wait for the ngx launcher page to be loaded and the section for selecting a runtime and mission to be clickable.
 * (`select-runtime-mission`) Click on the configured Runtime and Mission, click on the `⏬` button and wait for the section for selecting release strategy to be clickable.
 * (`select-pipeline`) Click on the configured Strategy, click on the `⏬` button and wait for the section for the git provider configurationto be clickable.
 * (`git-provider`)
   * If the `Log In & Authorize Account` is not clickable (github is connected), go to the next step, otherwise click on it, wait for the github login page to be loaded, fill in github and username and login the user, wait for the launcher page to be re-opened.
   * Fill in the repository name with unique name based on the space name, client index and username and click on the `⏬` button and wait for the summary section and the `Set Up Application` to be clickable.
 * (`view-new-application-button`) Click on the `Set Up Application`, wait for the set up application page to appear and wait for all the application set up steps to finish (`✓` icon displayed) and for the `View New Application` button to be clickable.
 * (`back-to-space`) Click on the `View New Application` and wait for the Space dashboard page to be loaded.
 * Mark the start timestamp for the `pipeline.build-release-started`

### Work with booster in Che (`che_workspace`)
The following steps are performed in sequence and a time to finish is measured for each step:
 * Start on the Space dashboard page.
 * (`codebases-page`) Click on the `Codebases` title and wait for the `Create a workspace` button to be clickable.
 * (`open-window`) Wait for the second window with Che to open. 
 * (`workspace-created`) Wait for the project tree to appear in Project Explorer.
 * (`run-project`) In the upper-menu click on the dropdown arrow right next to the run (`▶️`) button and then select the `run` item by clicking on it and wait for the configured success message to be printed in the `Run` tab at the bottom of the Che.
 * (`back-to-space`) Close the Che window and switch back to the first window (with Space dashboard page).

### Go through the pipeline build (`pipeline`)
The following steps are performed in sequence and a time to finish is measured for each step:
 * Start on the `Pipelines` page.
 * (`build-release-started`) Wait for the `Build Release` stage of the pipeline to be displayed. (Note: The time is measured from the end of the `create-quickstart-ngx` phase.
 * (`rollout-to-stage-started`) Wait for the `Rollout Release` stage of the pipeline to be displayed.
 * (`input-required-button`) Wait for the `Input Required` button to be displayed and clickable.
 * (`promote-button`) Click on the `Input Required` button, wait for the `Promote` button to be clickable.
 * (`rollout-to-run-started`) Click on the `Promote` button and wait for the `Rollout to Run` stage of the pipeline to be displayed.
 * (`rollout-to-run-success`) Wait for the `Rollout to Run` stage of the pipeline to complete with `SUCCESS` status.

### Remove the space (`remove_space`)
The following steps are performed in sequence and a time to finish is measured for each step:
 * (`my-spaces-page`) Navigate to the `/_myspaces` page and wait for the `Filter by Name` input box to be clickable.
 * (`filter-by-name`) Fill the name of the space into the `Filter by Name` input box, press `Enter` and wait for the `Active Filter:`
 * (`removed`) Click on the tree-dots-space-menu, click on the `Remove Space` button, click on the `Remove` button and wait for the `Create Space` button to be clickable.

## How to run the tests locally

### Prerequisities
Chrome or [Chromium browser](https://www.chromium.org/Home) with headless feature and [Chromedriver](https://sites.google.com/a/chromium.org/chromedriver/) needs to be installed where it is run (for Fedora/RHEL/CentOS):
```
$ sudo yum install chromium chromium-headless chromedriver
```

[Locust tool](https://docs.locust.io/en/stable/installation.html) needs to be installed (`pip install locustio`), as well.
```
$ locust -V    
[2018-04-23 16:19:13,971] localhost.localdomain/INFO/stdout: Locust 0.8.1
[2018-04-23 16:19:13,971] localhost.localdomain/INFO/stdout:
```

### Run the test
By default the load test executed by Locust tool runs in a distributed mode, i.e. uses remote access
to the Master and Slave nodes via SSH to start Locust process on those nodes to load the tested system
from a different places.

However, it is possible to switch the test to the local execution. To do that simply set the environment
variable `RUN_LOCALLY=true`. The easiest way is to uncomment the respective line in `_setenv.sh` file.

To run the test, configure the test in `_setenv.sh` file and run the `run.sh` script.
