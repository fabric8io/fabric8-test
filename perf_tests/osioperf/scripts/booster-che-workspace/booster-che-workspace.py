import os
import sys
import threading
import time

from locust import HttpLocust, TaskSet, task, events
from locust.exception import LocustError
from selenium import webdriver
from selenium.common.exceptions import NoSuchWindowException
from selenium.webdriver.common.action_chains import ActionChains as AC
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support.wait import TimeoutException

_serverScheme = "@@SERVER_SCHEME@@"
_serverHost = "@@SERVER_HOST@@"

_userNames = []
_userPasswords = []
_currentUser = 0
_userLock = threading.RLock()

usenv = os.getenv("USERS_PROPERTIES")
lines = usenv.split('\n')

_users = len(lines)

for u in lines:
    up = u.split('=')
    _userNames.append(up[0])
    _userPasswords.append(up[1])


class UserScenario(TaskSet):
    timeout = 60
    longTimeout = 900
    taskUser = -1
    taskUserName = ""
    taskUserPassword = ""
    newSpaceName = ""
    spaceUrl = ""
    userUrl = ""

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
        return WebDriverWait(driver, timeout).until(
            EC.element_to_be_clickable((by, value))
        )

    def _wait_for_non_clickable_element(self, driver, by, value):
        return WebDriverWait(driver, self.timeout).until_not(
            EC.element_to_be_clickable((by, value))
        )

    def _wait_for_url(self, driver, url_contains):
        return WebDriverWait(driver, self.timeout).until(
            EC.url_contains(url_contains)
        )

    def _report_success(self, request_type, name, response_time):
        # print "[OK]   request_type=" + request_type + ", name=" + name + ", response_time=" + str(response_time) + ", response_length=0"
        events.request_success.fire(request_type=request_type, name=name, response_time=response_time, response_length=0)

    def _report_failure(self, driver, request_type, name, response_time, msg):
        # print "[FAIL] request_type=" + request_type + ", name=" + name + ", response_time=" + str(response_time) + ", response_length=0"
        self._save_snapshot(driver, request_type + "_" + name + "-failure-screenshot-" + str(time.time()))
        # driver.quit()
        events.request_failure.fire(request_type=request_type, name=name, response_time=response_time, exception=LocustError(msg))

    def _save_snapshot(self, driver, name):
        driver.save_screenshot(name + ".png")

    def login(self, driver):
        request_type = "login"

        self._reset_timer()
        try:
            driver.get(self.locust.host)
            login_link = self._wait_for_clickable_link(driver, "LOG IN")
            self._report_success(request_type, "open-start-page", self._tick_timer())
        except TimeoutException:
            self._report_failure(driver, request_type, "open-start-page", self._tick_timer(), "Timeout waiting for 'LOG IN' button to be clickable.")
            return False

        self._reset_timer()
        try:
            login_link.click()
            self._wait_for_clickable_element(driver, By.ID, "kc-login")
            self._report_success(request_type, "open-login-page", self._tick_timer())
        except TimeoutException:
            self._report_failure(driver, request_type, "open-login-page", self._tick_timer(), "Timeout")
            return False

        driver.find_element_by_id("username").send_keys(self.taskUserName)
        passwd = driver.find_element_by_id("password")
        passwd.send_keys(self.taskUserPassword)

        self._reset_timer()
        try:
            passwd.submit()
            WebDriverWait(driver, self.timeout).until(
                EC.url_contains("_home")
            )
            self._report_success(request_type, "login", self._tick_timer())
        except TimeoutException:
            self._report_failure(driver, request_type, "login", self._tick_timer(), "Timeout")
            return False
        return True

    def create_space(self, driver):
        request_type = "create_space"
        self.newSpaceName = "Spejs-" + str(self.taskUser) + "-" + str(long(time.time() * 1000))
        self._reset_timer()
        try:
            self._wait_for_clickable_element(driver, By.CSS_SELECTOR, ".f8-card-heading-btn-link").click()
            self._report_success(request_type, "new-button", self._tick_timer())
        except TimeoutException:
            self._report_failure(driver, request_type, "new-button", self._tick_timer(), "Timeout")
            return False

        self._reset_timer()
        try:
            self._wait_for_clickable_element(driver, By.ID, "name").send_keys(self.newSpaceName)
            self._report_success(request_type, "fill-name", self._tick_timer())
        except TimeoutException:
            self._report_failure(driver, request_type, "fill-name", self._tick_timer(), "Timeout")
            return False

        self._reset_timer()
        try:
            target_element = self._wait_for_clickable_element(driver, By.ID, "createSpaceButton")
            self._report_success(request_type, "create-button", self._tick_timer())
        except TimeoutException:
            self._report_failure(driver, request_type, "create-button", self._tick_timer(), "Timeout")
            return False

        self._reset_timer()
        try:
            target_element.click()
            self._wait_for_clickable_element(driver, By.ID, "noThanksButton")
            self._report_success(request_type, "nothanks-button", self._tick_timer())
        except TimeoutException:
            self._report_failure(driver, request_type, "nothanks-button", self._tick_timer(), "Timeout")
            return False
        return True

    def create_quickstart(self, driver):
        request_type = "quickstart"
        target_element = self._wait_for_clickable_element(driver, By.ID, "noThanksButton")
        self._reset_timer()
        try:
            target_element.click()
            target_element = self._wait_for_clickable_element(driver, By.ID, "spacehome-my-codebases-create-button")
            self.spaceUrl = driver.current_url
            self.userUrl = self.spaceUrl.replace("/" + self.newSpaceName, "")
            self._report_success(request_type, "add-codebase-button", self._tick_timer())
        except TimeoutException:
            self._report_failure(driver, request_type, "add-codebase-button", self._tick_timer(), "Timeout")
            return False

        self._reset_timer()
        try:
            target_element.click()
            target_element = self._wait_for_clickable_element(driver, By.ID, "forgeQuickStartButton")
            self._report_success(request_type, "forge-quickstart-button", self._tick_timer())
        except TimeoutException:
            self._report_failure(driver, request_type, "forge-quickstart-button", self._tick_timer(), "Timeout")
            return False

        self._reset_timer()
        try:
            target_element.click()
            target_element = self._wait_for_clickable_element(driver, By.ID, "Vert.x HTTP Booster")
            self._report_success(request_type, "forge-1A-app-button", self._tick_timer())
        except TimeoutException:
            self._report_failure(driver, request_type, "forge-1A-app-button", self._tick_timer(), "Timeout")
            return False

        self._reset_timer()
        try:
            target_element.click()
            next_button_selector = "body > modal-container > div > div > quickstart-wizard > pfng-wizard > div.modal-footer.wizard-pf-footer.pfng-wizard-position-override > button.btn.btn-primary.wizard-pf-next"
            self._wait_for_non_clickable_element(driver, By.CSS_SELECTOR, next_button_selector)
            target_element = self._wait_for_clickable_element(driver, By.CSS_SELECTOR, next_button_selector)
            self._report_success(request_type, "forge-1A-next-button", self._tick_timer())
        except TimeoutException:
            self._report_failure(driver, request_type, "forge-1A-next-button", self._tick_timer(), "Timeout")
            return False

        self._reset_timer()
        try:
            target_element.click()
            target_element = self._wait_for_clickable_element(driver, By.ID, "groupId")
            self._report_success(request_type, "forge-1B-groupId", self._tick_timer())
        except TimeoutException:
            self._report_failure(driver, request_type, "forge-1B-groupId", self._tick_timer(), "Timeout")
            return False

        target_element.send_keys(".qa.performance")

        self._reset_timer()
        try:
            self._wait_for_non_clickable_element(driver, By.CSS_SELECTOR, next_button_selector)
            target_element = self._wait_for_clickable_element(driver, By.CSS_SELECTOR, next_button_selector)
            self._report_success(request_type, "forge-1B-next-button", self._tick_timer())
        except TimeoutException:
            self._report_failure(driver, request_type, "forge-1B-next-button", self._tick_timer(), "Timeout")
            return False

        self._reset_timer()
        try:
            target_element.click()
            self._wait_for_non_clickable_element(driver, By.CSS_SELECTOR, next_button_selector)
            target_element = self._wait_for_clickable_element(driver, By.CSS_SELECTOR, next_button_selector)
            self._report_success(request_type, "forge-2A-next-button", self._tick_timer())
        except TimeoutException:
            self._report_failure(driver, request_type, "forge-2A-next-button", self._tick_timer(), "Timeout")
            return False

        self._reset_timer()
        try:
            target_element.click()
            self._wait_for_non_clickable_element(driver, By.CSS_SELECTOR, next_button_selector)
            target_element = self._wait_for_clickable_element(driver, By.CSS_SELECTOR, next_button_selector)
            self._report_success(request_type, "forge-2B-finish-button", self._tick_timer())
        except TimeoutException:
            self._report_failure(driver, request_type, "forge-2B-finish-button", self._tick_timer(), "Timeout")
            return False

        self._reset_timer()
        try:
            target_element.click()
            target_element = self._wait_for_clickable_element(driver, By.CSS_SELECTOR, next_button_selector)
            self._report_success(request_type, "forge-3A-ok-button", self._tick_timer())
        except TimeoutException:
            self._report_failure(driver, request_type, "forge-3A-ok-button", self._tick_timer(), "Timeout")
            return False

        self._reset_timer()
        try:
            target_element.click()
            self._wait_for_clickable_element(driver, By.ID, "spacehome-pipelines-title")
            self._report_success(request_type, "pipeline-title", self._tick_timer())
        except TimeoutException:
            self._report_failure(driver, request_type, "pipeline-title", self._tick_timer(), "Timeout")
            return False
        return True

    def pipeline(self, driver):
        request_type = "pipeline"
        target_element = self._wait_for_clickable_element(driver, By.ID, "spacehome-pipelines-title")
        self._reset_timer()
        try:
            target_element.click()
            build_release_selector = "#pipelines > div.container-fluid.pipeline-list-container > div > div > div > fabric8-pipelines-list > div > fabric8-loading > div > div > div > div:nth-child(3) > div.animate-repeat > build-stage-view > div > div > div.pipeline-container > div > div > div > div.pipeline-stage-name.Running"
            self._wait_for_clickable_element(driver, By.CSS_SELECTOR, build_release_selector, timeout=self.longTimeout)
            self._report_success(request_type, "build-release-started", self._tick_timer())
        except TimeoutException:
            self._report_failure(driver, request_type, "build-release-started", self._tick_timer(), "Timeout")
            return False

        self._reset_timer()
        try:
            rollout_to_stage_selector = "#pipelines > div.container-fluid.pipeline-list-container > div > div > div > fabric8-pipelines-list > div > fabric8-loading > div > div > div > div:nth-child(3) > div.animate-repeat > build-stage-view > div > div > div.pipeline-container > div > div:nth-child(2) > div > div.pipeline-stage-name.Running"
            self._wait_for_clickable_element(driver, By.CSS_SELECTOR, rollout_to_stage_selector, timeout=self.longTimeout)
            self._report_success(request_type, "rollout-to-stage-started", self._tick_timer())
        except TimeoutException:
            self._report_failure(driver, request_type, "rollout-to-stage-started", self._tick_timer(), "Timeout")
            return False

        self._reset_timer()
        try:
            input_required_selector = "#pipelines > div.container-fluid.pipeline-list-container > div > div > div > fabric8-pipelines-list > div > fabric8-loading > div > div > div > div:nth-child(3) > div.animate-repeat > build-stage-view > div > div > div.pipeline-container > div > div:nth-child(3) > div > div.pipeline-actions > a"
            target_element = self._wait_for_clickable_element(driver, By.CSS_SELECTOR, input_required_selector, timeout=self.longTimeout)
            self._report_success(request_type, "input-required-button", self._tick_timer())
        except TimeoutException:
            self._report_failure(driver, request_type, "input-required-button", self._tick_timer(), "Timeout")
            return False

        self._reset_timer()
        try:
            target_element.click()
            abort_button_selector = "#pipelines > div.container-fluid.pipeline-list-container > div > div > div > fabric8-pipelines-list > div > fabric8-loading > div > div > div > div:nth-child(3) > div.animate-repeat > build-stage-view > input-action-dialog > modal > div > div > div > div.modal-footer > modal-footer > button.btn.btn-danger"
            target_element = self._wait_for_clickable_element(driver, By.CSS_SELECTOR, abort_button_selector)
            self._report_success(request_type, "abort-button", self._tick_timer())
        except TimeoutException:
            self._report_failure(driver, request_type, "abort-button", self._tick_timer(), "Timeout")
            return False

        self._reset_timer()
        try:
            target_element.click()
            self._wait_for_clickable_element(driver, By.ID, "header_dropdownToggle")
            self._wait_for_non_clickable_element(driver, By.CSS_SELECTOR, input_required_selector)
            self._report_success(request_type, "aborted", self._tick_timer())
        except TimeoutException:
            self._report_failure(driver, request_type, "aborted", self._tick_timer(), "Timeout")
            return False
        return True

    def remove_space(self, driver):
        request_type = "remove_space"
        try:
            self._reset_timer()
            driver.get(self.userUrl + "/_myspaces")
            self._wait_for_url(driver, "_myspaces")
            filter_by_name_selector = "body > f8-app > main > div > div:nth-child(3) > alm-profile > alm-my-spaces > div > my-spaces-toolbar > div > pfng-toolbar > div > div > form > div.form-group.toolbar-apf-filter > pfng-filter-fields > div > div > div:nth-child(2) > input"
            target_element = self._wait_for_clickable_element(driver, By.CSS_SELECTOR, filter_by_name_selector)
            self._report_success(request_type, "my-spaces-page", self._tick_timer())
        except TimeoutException:
            self._report_failure(driver, request_type, "my-spaces-page", self._tick_timer(), "Timeout")
            return False

        self._reset_timer()
        try:
            target_element.send_keys(self.newSpaceName)
            target_element.send_keys(Keys.RETURN)
            active_filter_selector = "body > f8-app > main > div > div:nth-child(3) > alm-profile > alm-my-spaces > div > my-spaces-toolbar > div > pfng-toolbar > div > div > pfng-filter-results > div > div > div > ul > li > span"
            self._wait_for_clickable_element(driver, By.CSS_SELECTOR, active_filter_selector)
            space_toggle_button_selector = "body > f8-app > main > div > div:nth-child(3) > alm-profile > alm-my-spaces > div > div > div > div > pfng-list > div > div:nth-child(2) > div > div.list-pf-content.list-pf-content-flex > div.list-pf-actions > my-spaces-item-actions > pfng-action > div > button"
            target_element = self._wait_for_clickable_element(driver, By.CSS_SELECTOR, space_toggle_button_selector)
            self._report_success(request_type, "filter-by-name", self._tick_timer())
        except TimeoutException:
            self._report_failure(driver, request_type, "filter-by-name", self._tick_timer(), "Timeout")
            return False

        self._reset_timer()
        try:
            target_element.click()
            target_element = self._wait_for_clickable_element(driver, By.PARTIAL_LINK_TEXT, "Remove space")
            target_element.click()
            remove_button_selector = "body > modal-container > div > div > div.modal-body > button.btn.btn-danger"
            target_element = self._wait_for_clickable_element(driver, By.CSS_SELECTOR, remove_button_selector)
            target_element.click()
            self._wait_for_clickable_element(driver, By.XPATH, "//button[contains(text(),'Create Space')]")
            self._report_success(request_type, "removed", self._tick_timer())
        except TimeoutException:
            self._report_failure(driver, request_type, "removed", self._tick_timer(), "Timeout")
            return False
        return True

    def che_workspace(self, driver):
        request_type = "che_workspace"
        failed = False

        metric = "codebases-page"
        try:
            driver.get(self.spaceUrl)
            target_element = self._wait_for_clickable_element(driver, By.ID, "spacehome-codebases-title")
            self._reset_timer()
            target_element.click()
            target_element = self._wait_for_clickable_element(driver, By.XPATH, ".//codebases-item-workspaces")
            self._report_success(request_type, metric, self._tick_timer())
        except TimeoutException:
            self._report_failure(driver, request_type, metric, self._tick_timer(), "Timeout")
            failed = True

        if not failed:
            metric = "open-window"
            self._reset_timer()
            try:
                target_element.click()
                WebDriverWait(driver, self.timeout).until(
                    EC.number_of_windows_to_be(2)
                )
                driver.switch_to.window(driver.window_handles[1])
                self._report_success(request_type, metric, self._tick_timer())
            except TimeoutException:
                self._report_failure(driver, request_type, metric, self._tick_timer(), "Timeout")
                failed = True
        else:
            self._report_failure(driver, request_type, metric, self._tick_timer(), "Skipped")

        if not failed:
            metric = "workspace-created"
            self._reset_timer()
            try:
                self._wait_for_clickable_element(driver, By.XPATH, "//*[@id='gwt-debug-projectTree']//*[@name='" + self.newSpaceName.lower() + "']", timeout=self.longTimeout)
                self._report_success(request_type, metric, self._tick_timer())
            except TimeoutException:
                self._report_failure(driver, request_type, metric, self._tick_timer(), "Timeout")
                failed = True
        else:
            self._report_failure(driver, request_type, metric, self._tick_timer(), "Skipped")

        if not failed:
            metric = "terminal-maximized"
            self._reset_timer()
            try:
                target_element = self._wait_for_clickable_element(driver, By.XPATH, ".//*[contains(@class,'GDPEHSMCKHC')][contains(text(),'Terminal')]")
                AC(driver) \
                    .double_click(target_element) \
                    .perform()
                target_element = self._wait_for_clickable_element(driver, By.XPATH, "//*[@id='gwt-debug-Terminal']//div[@class='terminal xterm xterm-theme-default']")
                self._report_success(request_type, metric, self._tick_timer())
            except TimeoutException:
                self._report_failure(driver, request_type, metric, self._tick_timer(), "Timeout")
                failed = True
        else:
            self._report_failure(driver, request_type, metric, self._tick_timer(), "Skipped")

        if not failed:
            metric = "maven-build"
            self._reset_timer()
            try:
                AC(driver) \
                    .click(target_element) \
                    .send_keys("cd " + self.newSpaceName.lower()) \
                    .send_keys(Keys.RETURN) \
                    .send_keys("mvn clean install -Popenshift,openshift-it") \
                    .send_keys(Keys.RETURN) \
                    .perform()

                WebDriverWait(driver, self.longTimeout).until(
                    EC.text_to_be_present_in_element((By.XPATH, "//*[@id='gwt-debug-Terminal']"), "Total time:")
                )
                self._save_snapshot(driver, request_type + "_" + metric + "-screenshot-" + str(time.time()))
                self._report_success(request_type, metric, self._tick_timer())
            except TimeoutException:
                self._report_failure(driver, request_type, metric, self._tick_timer(), "Timeout")
                failed = True
        else:
            self._report_failure(driver, request_type, metric, self._tick_timer(), "Skipped")

        if not failed:
            metric = "back-to-space"
            self._reset_timer()
            try:
                driver.switch_to.window(driver.window_handles[0])
                self._wait_for_url(driver, self.spaceUrl)
                self._report_success(request_type, metric, self._tick_timer())
            except TimeoutException:
                self._report_failure(driver, request_type, metric, self._tick_timer(), "Timeout")
                # failed = True
        else:
            self._report_failure(driver, request_type, metric, self._tick_timer(), "Skipped")

    @task
    def runScenario(self):
        opts = webdriver.ChromeOptions()
        opts.add_argument("--headless")
        opts.add_argument("--window-size=1280,960")
        opts.add_argument("--window-position=100,50")

        driver = webdriver.Chrome(chrome_options=opts)
        overall_start = time.time()
        try:
            # Must not fail
            if not self.login(driver):
                driver.quit()
                return

            # Must not fail
            if not self.create_space(driver):
                driver.quit()
                return

            # Must not fail
            if not self.create_quickstart(driver):
                driver.quit()
                return

            # Can fail
            self.che_workspace(driver)

            # if not self.pipeline(driver):
            #    driver.quit()
            #    return

            # Must not fail
            if not self.remove_space(driver):
                driver.quit()
                return

            driver.quit()
            self._report_success("global", "overall-time", (time.time() - overall_start) * 1000)
        except NoSuchWindowException:
            sys.exit(1)


class UserLocust(HttpLocust):
    task_set = UserScenario
    host = _serverScheme + "://" + _serverHost
    min_wait = 1000
    max_wait = 1000
