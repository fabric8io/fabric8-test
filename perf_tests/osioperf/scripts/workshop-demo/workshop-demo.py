import os
import sys
import threading
import time

from locust import HttpLocust, TaskSet, task, events
from locust.exception import LocustError
from selenium import webdriver
from selenium.common.exceptions import NoSuchWindowException
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait, Select

_serverScheme = "@@SERVER_SCHEME@@"
_serverHost = "@@SERVER_HOST@@"

_userNames = []
_userPasswords = []
_currentUser = 0
_userLock = threading.RLock()

jobBaseName = "@@JOB_BASE_NAME@@"
buildNumber = "@@BUILD_NUMBER@@"
launcherRuntime = "@@LAUNCHER_RUNTIME@@"
launcherMission = "@@LAUNCHER_MISSION@@"
launcherStrategy = "@@LAUNCHER_STRATEGY@@"
spacePrefix = "@@SPACE_PREFIX@@"

quickstartStartedTerminal = "@@QUICKSTART_STARTED_TERMINAL@@"

githubUsername = os.getenv("GH_USER")
githubPassword = os.getenv("GH_TOKEN")

usenv = os.getenv("USERS_PROPERTIES")
lines = usenv.split('\n')

_users = len(lines)

for u in lines:
    up = u.split('=')
    _userNames.append(up[0])
    _userPasswords.append(up[1])


class UserScenario(TaskSet):
    SKIPPED_MSG = "Skipped"
    timeout = 60
    midTimeout = 120
    longTimeout = 1800
    taskUser = -1
    taskUserName = ""
    taskUserPassword = ""
    newSpaceName = ""
    ghRepoName = "n/a"
    spaceUrl = ""
    userUrl = ""
    jenkinsProject = ""

    resetEnvironment = True

    start = -1
    stop = -1

    def on_start(self):
        global _currentUser, _users, _userLock, _userNames, _userPasswords
        _userLock.acquire()
        self.taskUser = _currentUser
        if _currentUser < _users - 1:
            _currentUser += 1
        else:
            _currentUser = 0
        _userLock.release()
        self.taskUserName = _userNames[self.taskUser]
        self.taskUserPassword = _userPasswords[self.taskUser]

    def _reset_timer(self):
        self.start = time.time()

    def _tick_timer(self):
        self.stop = time.time()
        ret_val = (self.stop - self.start) * 1000
        self.start = self.stop
        return ret_val

    def _wait_for_clickable_link(self, driver, link_text):
        return WebDriverWait(driver, self.timeout).until(
            EC.element_to_be_clickable((By.PARTIAL_LINK_TEXT, link_text))
        )

    def _wait_for_clickable_element(self, driver, by, value, timeout=-1):
        if timeout < 0:
            timeout = self.timeout
        element = WebDriverWait(driver, timeout).until(
            EC.element_to_be_clickable((by, value))
        )
        return element

    def _wait_for_non_clickable_element(self, driver, by, value):
        return WebDriverWait(driver, self.timeout).until_not(
            EC.element_to_be_clickable((by, value))
        )

    def _wait_for_url(self, driver, url_contains):
        return WebDriverWait(driver, self.timeout).until(
            EC.url_contains(url_contains)
        )

    def _report_success(self, request_type, name, response_time):
        events.request_success.fire(
            request_type=request_type, name=name, response_time=response_time, response_length=0)

    def _report_failure(self, driver, request_type, name, response_time, msg):
        if not msg == self.SKIPPED_MSG:
            timestamp = time.time()
            self._save_snapshot(
                driver,
                "{}_{}-failure-screeshot-{}".format(
                    request_type,
                    name,
                    timestamp
                )
            )
            self._save_browser_log(
                driver,
                "{}_{}-failure-browser-{}".format(
                    request_type,
                    name,
                    timestamp
                )
            )

        # driver.quit()
        events.request_failure.fire(request_type=request_type, name=name,
                                    response_time=response_time, exception=LocustError(msg))

    def _save_snapshot(self, driver, name):
        driver.save_screenshot(
            "{}-{}-{}.png".format(jobBaseName, buildNumber, name)
        )

    def _save_browser_log(self, driver, name):
        f = open(
            "{}-{}-{}.log".format(jobBaseName, buildNumber, name),
            "w"
        )
        f.write(str(driver.get_log('browser')))

    def login(self, driver, _failed=False):
        failed = _failed
        request_type = "login"
        metric = "open-start-page"
        if not failed:
            self._reset_timer()
            try:
                driver.get(self.locust.host)
                login_link = self._wait_for_clickable_link(driver, "LOG IN")
                self._report_success(request_type, metric, self._tick_timer())
            except Exception as ex:
                self._report_failure(driver, request_type,
                                     metric, self._tick_timer(), str(ex))
                failed = True
        else:
            self._report_failure(driver, request_type,
                                 metric, self._tick_timer(), self.SKIPPED_MSG)

        metric = "open-login-page"
        if not failed:

            self._reset_timer()
            try:
                login_link.click()
                self._wait_for_clickable_element(driver, By.ID, "kc-login")
                self._report_success(request_type, metric, self._tick_timer())
            except Exception as ex:
                self._report_failure(driver, request_type,
                                     metric, self._tick_timer(), str(ex))
                failed = True
        else:
            self._report_failure(driver, request_type,
                                 metric, self._tick_timer(), self.SKIPPED_MSG)

        metric = "login"
        if not failed:
            try:
                driver.find_element_by_id(
                    "username").send_keys(self.taskUserName)
                passwd = driver.find_element_by_id("password")
                passwd.send_keys(self.taskUserPassword)

                self._reset_timer()

                passwd.submit()
                self._wait_for_url(driver, "_home")
                self._report_success(request_type, metric, self._tick_timer())
            except Exception as ex:
                self._report_failure(driver, request_type,
                                     metric, self._tick_timer(), str(ex))
                failed = True
        else:
            self._report_failure(driver, request_type,
                                 metric, self._tick_timer(), self.SKIPPED_MSG)

        return failed

    def reset_environment(self, driver, failed=False):
        request_type = "setup"

        metric = "reset-environment"
        if not failed:
            try:
                cleanUrl = "{}/{}/_cleanup".format(
                    self.locust.host,
                    self.taskUserName
                )
                driver.get(cleanUrl)

                self._wait_for_url(driver, cleanUrl)
                time.sleep(3)
                target_element = self._wait_for_clickable_element(
                    driver, By.XPATH, "//*[text()='Erase My OpenShift.io Environment']")
                target_element.click()

                target_element = self._wait_for_clickable_element(
                    driver, By.NAME, "username")
                target_element.clear()
                target_element.send_keys(self.taskUserName)

                target_element = self._wait_for_clickable_element(
                    driver, By.XPATH,
                    "//*[text()='I understand my actions - erase my environment']")

                self._reset_timer()
                target_element.click()

                self._wait_for_clickable_element(
                    driver, By.XPATH, "//*[contains(@class,'alert-success')]")

                self._report_success(request_type, metric, self._tick_timer())
            except Exception as ex:
                self._report_failure(driver, request_type,
                                     metric, self._tick_timer(), str(ex))
                failed = True
        else:
            self._report_failure(driver, request_type,
                                 metric, self._tick_timer(), self.SKIPPED_MSG)

        return failed

    def create_space_by_launcher(self, driver, _failed=False):
        failed = _failed
        request_type = "create_space_ngx"

        self.newSpaceName = "{}-{}-{}-{}".format(
            spacePrefix,
            buildNumber,
            self.taskUser,
            (int(time.time() * 1000))
        )
        self.ghRepoName = "{}-{}".format(
            self.newSpaceName,
            self.taskUserName.replace("@", "_").replace(".", "_")
        ).lower()

        metric = "open-home"
        if not failed:
            self._reset_timer()
            try:
                homeUrl = "{}/_home".format(self.locust.host)
                driver.get(homeUrl)
                self._wait_for_url(driver, homeUrl)
                target_element = self._wait_for_clickable_element(
                    driver,
                    By.ID,
                    "header_dropdownToggle"
                )
                self._report_success(request_type, metric, self._tick_timer())
            except Exception as ex:
                self._report_failure(driver, request_type,
                                     metric, self._tick_timer(), str(ex))
                failed = True
        else:
            self._report_failure(driver, request_type,
                                 metric, self._tick_timer(), self.SKIPPED_MSG)

        time.sleep(2)

        metric = "create-space-form"
        if not failed:
            self._reset_timer()
            try:
                target_element.click()
                self._wait_for_clickable_link(
                    driver,
                    "Create Space"
                )
                self._wait_for_clickable_link(
                    driver,
                    "Spaces"
                )
                self._wait_for_clickable_link(
                    driver,
                    "Home"
                )
                target_element = self._wait_for_clickable_element(
                    driver,
                    By.XPATH,
                    "//*[contains(@class,'pficon pficon-add-circle-o')]"
                )
                target_element.click()
                self._wait_for_clickable_element(
                    driver,
                    By.ID,
                    "add-space-overlay-name"
                ).send_keys(self.newSpaceName)
                target_element = self._wait_for_clickable_element(
                    driver,
                    By.ID,
                    "createSpaceButton"
                )
                self._report_success(request_type, metric, self._tick_timer())
            except Exception as ex:
                self._report_failure(driver, request_type,
                                     metric, self._tick_timer(), str(ex))
                failed = True
        else:
            self._report_failure(driver, request_type,
                                 metric, self._tick_timer(), self.SKIPPED_MSG)

        metric = "space-page-open"
        if not failed:
            self._reset_timer()
            try:
                target_element.click()
                target_element = self._wait_for_clickable_element(
                    driver,
                    By.XPATH,
                    "//*[contains(@class,'f8launcher-container_close')]//*[contains(@class,'pficon-close')]"
                )
                self._wait_for_url(driver, self.newSpaceName)
                self.spaceUrl = driver.current_url
                self.userUrl = self.spaceUrl.replace(
                    "/{}".format(self.newSpaceName),
                    ""
                )
                driver.get(self.spaceUrl)
                self._report_success(request_type, metric, self._tick_timer())
            except Exception as ex:
                self._report_failure(driver, request_type,
                                     metric, self._tick_timer(), str(ex))
                failed = True
        else:
            self._report_failure(driver, request_type,
                                 metric, self._tick_timer(), self.SKIPPED_MSG)
        return failed

    def create_quickstart_by_launcher(self, driver, _failed=False):
        failed = _failed
        request_type = "create-quickstart-ngx"

        time.sleep(2)

        metric = "add-to-space-button"
        if not failed:
            self._reset_timer()
            try:
                target_element = self._wait_for_clickable_element(
                    driver,
                    By.ID,
                    "spacehome-pipelines-add-button"
                )
                self._report_success(request_type, metric, self._tick_timer())
            except Exception as ex:
                self._report_failure(driver, request_type,
                                     metric, self._tick_timer(), str(ex))
                failed = True
        else:
            self._report_failure(driver, request_type,
                                 metric, self._tick_timer(), self.SKIPPED_MSG)

        metric = "app-name"
        if not failed:
            self._reset_timer()
            try:
                target_element.click()
                target_element = self._wait_for_clickable_element(
                    driver, By.ID, "projectName")
                target_element.clear()
                target_element.send_keys(self.newSpaceName)
                target_element = self._wait_for_clickable_element(
                    driver,
                    By.XPATH,
                    "//*[contains(text(),'Create a new codebase')]/ancestor::*[contains(@class,'code-imports--step_content')]"
                )
                target_element.click()
                target_element = self._wait_for_clickable_element(
                    driver,
                    By.XPATH,
                    "//*[contains(text(),'Continue')]"
                )
                self._report_success(request_type, metric, self._tick_timer())
            except Exception as ex:
                self._report_failure(driver, request_type,
                                     metric, self._tick_timer(), str(ex))
                failed = True
        else:
            self._report_failure(driver, request_type,
                                 metric, self._tick_timer(), self.SKIPPED_MSG)

        metric = "launcher-page-open"
        if not failed:
            self._reset_timer()
            try:
                target_element.click()
                self._wait_for_clickable_element(
                    driver, By.CSS_SELECTOR, ".f8launcher-container_nav")
                self._wait_for_clickable_element(
                    driver, By.CSS_SELECTOR, ".f8launcher-container_main")
                target_element = self._wait_for_clickable_element(
                    driver,
                    By.XPATH,
                    "//div[@class='list-group-item-heading'][contains(text(),'{}')]".format(
                        launcherRuntime
                    )
                )
                self._report_success(request_type, metric, self._tick_timer())
            except Exception as ex:
                self._report_failure(driver, request_type,
                                     metric, self._tick_timer(), str(ex))
                failed = True
        else:
            self._report_failure(driver, request_type,
                                 metric, self._tick_timer(), self.SKIPPED_MSG)

        time.sleep(1)

        metric = "select-runtime-mission"
        if not failed:
            self._reset_timer()
            try:
                target_element.click()
                target_element = self._wait_for_clickable_element(
                    driver,
                    By.XPATH,
                    "//div[@class='list-group-item-heading'][contains(text(),'{}')]".format(
                        launcherMission
                    )
                )
                target_element.click()
                target_element = self._wait_for_clickable_element(
                    driver,
                    By.XPATH,
                    "//f8launcher-missionruntime-createapp-step//*[@class='f8launcher-continue']//*[contains(@class,'btn')]"
                )
                driver.execute_script(
                    "arguments[0].scrollIntoView(false);", target_element)
                target_element.click()
                target_element = self._wait_for_clickable_element(
                    driver,
                    By.XPATH,
                    "//*[contains(@class,'f8launcher-section-release-strategy')]//*[contains(@class,'list-view-pf-description')]//span[last()]//*[@class='f8launcher-pipeline-stages--name'][contains(text(),'{}')]".format(
                        launcherStrategy
                    )
                )
                self._report_success(request_type, metric, self._tick_timer())
            except Exception as ex:
                self._report_failure(driver, request_type,
                                     metric, self._tick_timer(), str(ex))
                failed = True
        else:
            self._report_failure(driver, request_type,
                                 metric, self._tick_timer(), self.SKIPPED_MSG)

        time.sleep(1)

        metric = "select-release-strategy"
        if not failed:
            self._reset_timer()
            try:
                driver.execute_script(
                    "arguments[0].scrollIntoView(false);", target_element)
                target_element.click()
                target_element = self._wait_for_clickable_element(
                    driver,
                    By.XPATH,
                    "//f8launcher-releasestrategy-createapp-step//*[@class='f8launcher-continue']//*[contains(@class,'btn')]"
                )
                driver.execute_script(
                    "arguments[0].scrollIntoView(false);", target_element)
                target_element.click()
                self._report_success(request_type, metric, self._tick_timer())
            except Exception as ex:
                self._report_failure(driver, request_type,
                                     metric, self._tick_timer(), str(ex))
                failed = True
        else:
            self._report_failure(driver, request_type,
                                 metric, self._tick_timer(), self.SKIPPED_MSG)

        time.sleep(1)

        metric = "git-provider"
        if not failed:
            self._reset_timer()
            try:
                target_element = self._wait_for_clickable_element(
                    driver,
                    By.ID,
                    "ghOrg"
                )

                select = Select(target_element)
                select.select_by_visible_text(githubUsername)
                target_element = self._wait_for_clickable_element(
                    driver,
                    By.ID,
                    "ghRepo"
                )
                target_element.clear()
                target_element.send_keys(self.ghRepoName)
                target_element = self._wait_for_clickable_element(
                    driver,
                    By.XPATH,
                    "//f8launcher-gitprovider-createapp-step//*[@class='f8launcher-continue']//*[contains(@class,'btn')]"
                )
                driver.execute_script(
                    "arguments[0].scrollIntoView(false);", target_element)
                self._report_success(request_type, metric, self._tick_timer())
            except Exception as ex:
                self._report_failure(driver, request_type,
                                     metric, self._tick_timer(), str(ex))
                failed = True
        else:
            self._report_failure(driver, request_type,
                                 metric, self._tick_timer(), self.SKIPPED_MSG)

        time.sleep(1)

        metric = "verify-summary"
        if not failed:
            self._reset_timer()
            try:
                target_element.click()
                self._wait_for_clickable_element(
                    driver,
                    By.XPATH,
                    "//f8launcher-projectsummary-createapp-step//*[contains(text(),'Mission')]//ancestor::*[contains(@class,'card-pf--xsmall')]//*[contains(text(),'{}')]".format(
                        launcherMission
                    )
                )
                self._wait_for_clickable_element(
                    driver,
                    By.XPATH,
                    "//f8launcher-projectsummary-createapp-step//*[contains(text(),'Runtime')]//ancestor::*[contains(@class,'card-pf--xsmall')]//*[contains(text(),'{}')]".format(
                        launcherRuntime
                    )
                )
                target_element = self._wait_for_clickable_element(
                    driver,
                    By.XPATH,
                    "//*[contains(@class,'btn')][contains(text(),'Set Up Application')]"
                )
                driver.execute_script(
                    "arguments[0].scrollIntoView(false);",
                    target_element
                )
                self._report_success(request_type, metric, self._tick_timer())
            except Exception as ex:
                self._report_failure(driver, request_type,
                                     metric, self._tick_timer(), str(ex))
                failed = True
        else:
            self._report_failure(driver, request_type,
                                 metric, self._tick_timer(), self.SKIPPED_MSG)

        metric = "create-new-application"
        if not failed:
            time.sleep(2)
            self._reset_timer()
            try:
                target_element.click()
                self._wait_for_clickable_element(
                    driver,
                    By.XPATH,
                    self._project_booster_ok_icon(
                        "Creating your new GitHub repository"
                    )
                )
                self._wait_for_clickable_element(
                    driver,
                    By.XPATH,
                    self._project_booster_ok_icon(
                        "Pushing your customized Booster code into the repo"
                    )
                )
                self._wait_for_clickable_element(
                    driver,
                    By.XPATH,
                    self._project_booster_ok_icon(
                        "Creating your project on OpenShift"
                    )
                )
                self._wait_for_clickable_element(
                    driver,
                    By.XPATH,
                    self._project_booster_ok_icon(
                        "Setting up your build pipeline"
                    )
                )
                self._wait_for_clickable_element(
                    driver,
                    By.XPATH,
                    self._project_booster_ok_icon(
                        "Configuring to trigger builds on Git pushes"
                    )
                )
                target_element = self._wait_for_clickable_element(
                    driver,
                    By.XPATH,
                    "//*[contains(@class,'f8launcher-continue')]//*[contains(text(),'View New Application')]"
                )
                self._report_success(request_type, metric, self._tick_timer())
            except Exception as ex:
                self._report_failure(driver, request_type,
                                     metric, self._tick_timer(), str(ex))
                failed = True
        else:
            self._report_failure(driver, request_type,
                                 metric, self._tick_timer(), self.SKIPPED_MSG)

        metric = "back-to-space"
        if not failed:
            self._reset_timer()
            try:
                target_element.click()
                self._wait_for_clickable_element(
                    driver, By.ID, "spacehome-pipelines-title")
                self._report_success(request_type, metric, self._tick_timer())
            except Exception as ex:
                self._report_failure(driver, request_type,
                                     metric, self._tick_timer(), str(ex))
                failed = True
        else:
            self._report_failure(driver, request_type,
                                 metric, self._tick_timer(), self.SKIPPED_MSG)

        return failed

    @staticmethod
    def _project_booster_ok_icon(name):
        return "//*[contains(text(),'{}')]//ancestor::*[contains(@class,'pfng-list-content')]//*[contains(@class,'pficon-ok')]".format(
            name
        )

    def che_workspace(self, driver, _failed=False):
        failed = _failed
        request_type = "che_workspace"

        metric = "codebases-page"
        if not failed:
            try:
                driver.get(self.spaceUrl)
                target_element = self._wait_for_clickable_element(
                    driver,
                    By.XPATH,
                    ".//*[contains(@class,'navbar-collapse')]//*[contains(text(),'Create')]"
                )
                self._reset_timer()
                target_element.click()
                target_element = self._wait_for_clickable_element(
                    driver,
                    By.XPATH,
                    ".//codebases-item-workspaces//a"
                )
                self._report_success(request_type, metric, self._tick_timer())
            except Exception as ex:
                self._report_failure(driver, request_type,
                                     metric, self._tick_timer(), str(ex))
                failed = True
        else:
            self._report_failure(driver, request_type,
                                 metric, self._tick_timer(), self.SKIPPED_MSG)

        metric = "open-window"
        if not failed:
            self._reset_timer()
            try:
                tabs = len(driver.window_handles)
                target_element.click()
                target_element = self._wait_for_clickable_element(
                    driver,
                    By.XPATH,
                    ".//codebases-item-workspaces//button"
                )
                target_element.click()
                WebDriverWait(driver, self.timeout).until(
                    EC.number_of_windows_to_be(tabs + 1)
                )
                driver.switch_to.window(driver.window_handles[tabs])
                self._report_success(request_type, metric, self._tick_timer())
            except Exception as ex:
                self._report_failure(driver, request_type,
                                     metric, self._tick_timer(), str(ex))
                failed = True
        else:
            self._report_failure(driver, request_type,
                                 metric, self._tick_timer(), self.SKIPPED_MSG)

        metric = "workspace-created"
        if not failed:
            self._reset_timer()
            try:
                self._wait_for_clickable_element(
                    driver,
                    By.XPATH,
                    "//*[@id='gwt-debug-projectTree']//*[@name='{}']".format(
                        self.ghRepoName
                    ),
                    timeout=self.midTimeout)
                self._wait_for_clickable_element(
                    driver,
                    By.XPATH,
                    ".//*[@id='gwt-debug-multiSplitPanel-tabsPanel']//*[contains(text(),'Terminal')]"
                )
                self._report_success(request_type, metric, self._tick_timer())
            except Exception as ex:
                self._report_failure(driver, request_type,
                                     metric, self._tick_timer(), str(ex))
                failed = True
        else:
            self._report_failure(driver, request_type,
                                 metric, self._tick_timer(), self.SKIPPED_MSG)

        driver.close()
        driver.switch_to_window(driver.window_handles[0])

        return failed

    def pipeline(self, driver, _failed=False, qs_created_time=-1):
        failed = _failed
        request_type = "pipeline"

        metric = "build-release-started"
        if not failed:
            self._reset_timer()
            build_release_started = -1
            try:
                createPipelinesUrl = "{}/create/pipelines".format(
                    self.spaceUrl
                )
                driver.get(createPipelinesUrl)
                self._wait_for_url(driver, createPipelinesUrl)
                self._wait_for_clickable_element(
                    driver,
                    By.XPATH,
                    "//*[contains(text(),'Build Release')][contains(@title,'status: IN_PROGRESS')]",
                    timeout=self.longTimeout
                )
                if qs_created_time > 0:
                    build_release_started = (
                        time.time() - qs_created_time) * 1000
                else:
                    build_release_started = self._tick_timer()
                self._report_success(request_type, metric,
                                     build_release_started)
            except Exception as ex:
                self._report_failure(driver, request_type,
                                     metric, build_release_started, str(ex))
                failed = True
        else:
            self._report_failure(driver, request_type,
                                 metric, self._tick_timer(), self.SKIPPED_MSG)

        metric = "rollout-to-stage-started"
        if not failed:
            self._reset_timer()
            try:
                self._wait_for_clickable_element(
                    driver,
                    By.XPATH,
                    "//*[contains(text(),'Rollout to Stage')][contains(@title,'status: IN_PROGRESS')]",
                    timeout=self.longTimeout
                )
                self._report_success(request_type, metric, self._tick_timer())
            except Exception as ex:
                self._report_failure(driver, request_type,
                                     metric, self._tick_timer(), str(ex))
                failed = True
        else:
            self._report_failure(driver, request_type,
                                 metric, self._tick_timer(), self.SKIPPED_MSG)

        metric = "input-required-button"
        if not failed:
            self._reset_timer()
            try:

                target_element = self._wait_for_clickable_element(
                    driver,
                    By.XPATH,
                    "//*[contains(text(),'Input Required')]",
                    timeout=self.longTimeout
                )
                self._report_success(request_type, metric, self._tick_timer())
            except Exception as ex:
                self._report_failure(driver, request_type,
                                     metric, self._tick_timer(), str(ex))
                failed = True
        else:
            self._report_failure(driver, request_type,
                                 metric, self._tick_timer(), self.SKIPPED_MSG)

        metric = "promote-button"
        if not failed:
            self._reset_timer()
            try:
                target_element.click()
                target_element = self._wait_for_clickable_element(
                    driver,
                    By.XPATH,
                    "//*[contains(text(),'Promote')]"
                )
                self._report_success(request_type, metric, self._tick_timer())
            except Exception as ex:
                self._report_failure(driver, request_type,
                                     metric, self._tick_timer(), str(ex))
                failed = True
        else:
            self._report_failure(driver, request_type,
                                 metric, self._tick_timer(), self.SKIPPED_MSG)

        metric = "rollout-to-run-started"
        if not failed:
            self._reset_timer()
            try:
                target_element.click()
                self._wait_for_clickable_element(
                    driver,
                    By.XPATH,
                    "//*[contains(text(),'Rollout to Run')][contains(@title,'status: IN_PROGRESS')]",
                    timeout=self.longTimeout
                )
                self._report_success(request_type, metric, self._tick_timer())
            except Exception as ex:
                self._report_failure(driver, request_type,
                                     metric, self._tick_timer(), str(ex))
                failed = True
        else:
            self._report_failure(driver, request_type,
                                 metric, self._tick_timer(), self.SKIPPED_MSG)

        metric = "rollout-to-run-success"
        if not failed:
            self._reset_timer()
            try:
                self._wait_for_clickable_element(
                    driver,
                    By.XPATH,
                    "//*[contains(text(),'Rollout to Run')][contains(@title,'status: SUCCESS')]",
                    timeout=self.longTimeout
                )
                self._report_success(request_type, metric, self._tick_timer())
            except Exception as ex:
                self._report_failure(driver, request_type,
                                     metric, self._tick_timer(), str(ex))
                failed = True
        else:
            self._report_failure(driver, request_type,
                                 metric, self._tick_timer(), self.SKIPPED_MSG)

        return failed

    def remove_space(self, driver, _failed=False):
        failed = _failed
        request_type = "remove_space"
        metric = "my-spaces-page"
        if not failed:
            self._reset_timer()
            try:
                mySpacesUrl = "{}/_myspaces".format(self.userUrl)
                driver.get(mySpacesUrl)
                self._wait_for_url(driver, "_myspaces")
                target_element = self._wait_for_clickable_element(
                    driver,
                    By.XPATH,
                    "//input[contains(@placeholder, 'Filter by Name')]"
                )
                self._report_success(request_type, metric, self._tick_timer())
            except Exception as ex:
                self._report_failure(driver, request_type,
                                     metric, self._tick_timer(), str(ex))
                failed = True
        else:
            self._report_failure(driver, request_type,
                                 metric, self._tick_timer(), self.SKIPPED_MSG)

        metric = "filter-by-name"
        if not failed:
            self._reset_timer()
            try:
                target_element.send_keys(self.newSpaceName)
                target_element.send_keys(Keys.RETURN)
                self._wait_for_clickable_element(
                    driver,
                    By.XPATH,
                    "//*[contains(text(), 'Active filters:')]"
                )
                target_element = self._wait_for_clickable_element(
                    driver,
                    By.XPATH,
                    "//*[contains(@class,'list-pf-actions')]//*[@dropdowntoggle]"
                )
                self._report_success(request_type, metric, self._tick_timer())
            except Exception as ex:
                self._report_failure(driver, request_type,
                                     metric, self._tick_timer(), str(ex))
                failed = True
        else:
            self._report_failure(driver, request_type,
                                 metric, self._tick_timer(), self.SKIPPED_MSG)

        metric = "removed"
        if not failed:
            self._reset_timer()
            try:
                target_element.click()
                target_element = self._wait_for_clickable_element(
                    driver,
                    By.PARTIAL_LINK_TEXT,
                    "Remove space"
                )
                target_element.click()
                remove_button_selector = "body > modal-container > div > div > div.modal-body > button.btn.btn-danger"
                target_element = self._wait_for_clickable_element(
                    driver,
                    By.CSS_SELECTOR,
                    remove_button_selector
                )
                target_element.click()
                self._wait_for_clickable_element(
                    driver,
                    By.XPATH,
                    "//button[contains(text(),'Create Space')]"
                )
                self._report_success(request_type, metric, self._tick_timer())
            except Exception as ex:
                self._report_failure(driver, request_type,
                                     metric, self._tick_timer(), str(ex))
                failed = True
        else:
            self._report_failure(driver, request_type,
                                 metric, self._tick_timer(), self.SKIPPED_MSG)

        return failed

    @task
    def runScenario(self):

        opts = webdriver.ChromeOptions()
        opts.add_argument("--headless")
        opts.add_argument("--window-size=1920,1080")
        opts.add_argument("--window-position=0,0")

        driver = webdriver.Chrome(chrome_options=opts)
        overall_start = time.time()
        try:
            failed = self.login(driver)

            if self.resetEnvironment:
                failed = self.reset_environment(driver, failed)
                if not failed:
                    self.resetEnvironment = False

            failed = self.create_space_by_launcher(driver, failed)

            failed = self.create_quickstart_by_launcher(driver, failed)
            qs_created_time = time.time()

            failed = self.che_workspace(driver, failed)

            failed = self.pipeline(driver, False, qs_created_time) | failed

            failed = self.remove_space(driver, False) | failed

            driver.quit()
            if not failed:
                self._report_success(
                    "global", "overall-time", (time.time() - overall_start) * 1000)
            else:
                self._report_failure(driver, "global", "overall-time",
                                     (time.time() - overall_start) * 1000, "Something went wrong.")

        except NoSuchWindowException:
            sys.exit(1)


class UserLocust(HttpLocust):
    task_set = UserScenario
    host = "{}://{}".format(_serverScheme, _serverHost)
    min_wait = 1000
    max_wait = 1000
