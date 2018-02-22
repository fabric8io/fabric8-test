import os
import threading
import time

from locust import HttpLocust, TaskSet, task, events
from locust.exception import LocustError
from selenium import webdriver
from selenium.common.exceptions import NoSuchWindowException
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
    taskUser = -1
    taskUserName = ""
    taskUserPassword = ""

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
        # driver.get_screenshot_as_file(request_type + "_" + name + "-failure-screenshot-" + str(time.time()) + ".png")
        driver.quit()
        events.request_failure.fire(request_type=request_type, name=name, response_time=response_time, exception=LocustError(msg))

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

    def workshop(self, driver):
        request_type = "create_space"
        self._reset_timer()
        try:
            self._wait_for_clickable_element(driver, By.CSS_SELECTOR, ".f8-card-heading-btn-link").click()
            self._report_success(request_type, "new-button", self._tick_timer())
        except TimeoutException:
            self._report_failure(driver, request_type, "new-button", self._tick_timer(), "Timeout")
            return False

        new_space_name = "Spejs-" + str(self.taskUser) + "-" + str(long(time.time() * 1000))
        self._reset_timer()
        try:
            self._wait_for_clickable_element(driver, By.ID, "name").send_keys(new_space_name)
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
            target_element = self._wait_for_clickable_element(driver, By.ID, "noThanksButton")
            self._report_success(request_type, "nothanks-button", self._tick_timer())
        except TimeoutException:
            self._report_failure(driver, request_type, "nothanks-button", self._tick_timer(), "Timeout")
            return False

        try:
            target_element.click()
            self._wait_for_clickable_element(driver, By.ID, "spacehome-my-codebases-create-button")
            space_url = driver.current_url
            user_url = space_url.replace("/" + new_space_name, "")
            self._report_success(request_type, "add-codebase-button", self._tick_timer())
        except TimeoutException:
            self._report_failure(driver, request_type, "add-codebase-button", self._tick_timer(), "Timeout")
            return False

        request_type = "remove_space"
        try:
            self._reset_timer()
            driver.get(user_url + "/_myspaces")
            self._wait_for_url(driver, "_myspaces")
            filter_by_name_selector = "body > f8-app > main > div > div:nth-child(3) > alm-profile > alm-my-spaces > div > my-spaces-toolbar > div > pfng-toolbar > div > div > form > div.form-group.toolbar-apf-filter > pfng-filter-fields > div > div > div:nth-child(2) > input"
            target_element = self._wait_for_clickable_element(driver, By.CSS_SELECTOR, filter_by_name_selector)
            self._report_success(request_type, "my-spaces-page", self._tick_timer())
        except TimeoutException:
            self._report_failure(driver, request_type, "my-spaces-page", self._tick_timer(), "Timeout")
            return False

        self._reset_timer()
        try:
            target_element.send_keys(new_space_name)
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
            create_space_button_selector = "body > f8-app > main > div > div:nth-child(3) > alm-profile > alm-my-spaces > div > div > div > div > pfng-list > pfng-empty-state > div > div.blank-slate-pf-main-action > button"
            self._wait_for_clickable_element(driver, By.CSS_SELECTOR, create_space_button_selector)
            self._report_success(request_type, "removed", self._tick_timer())
        except TimeoutException:
            self._report_failure(driver, request_type, "removed", self._tick_timer(), "Timeout")
            return False
        return True

    @task
    def runScenario(self):
        opts = webdriver.ChromeOptions()
        opts.add_argument("--headless")
        opts.add_argument("--window-size=1280,960")

        driver = webdriver.Chrome(chrome_options=opts)

        try:
            if not self.login(driver):
                driver.quit()
                return

            # if not self.workshop(driver):
            #    driver.quit()
            #    return
            self.workshop(driver)

            driver.quit()
        except NoSuchWindowException:
            pass


class UserLocust(HttpLocust):
    task_set = UserScenario
    host = _serverScheme + "://" + _serverHost
    min_wait = 1000
    max_wait = 1000
