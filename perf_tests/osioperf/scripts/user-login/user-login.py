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
        events.request_success.fire(
            request_type=request_type,
            name=name,
            response_time=response_time,
            response_length=0
        )

    def _report_failure(self, driver, request_type, name, response_time, msg):
        driver.quit()
        events.request_failure.fire(
            request_type=request_type,
            name=name,
            response_time=response_time,
            exception=LocustError(msg)
        )

    def login(self, driver):
        request_type = "login"

        self._reset_timer()
        try:
            driver.get(self.locust.host)
            login_link = self._wait_for_clickable_link(driver, "LOG IN")
            self._report_success(
                request_type,
                "open-start-page",
                self._tick_timer()
            )
        except TimeoutException:
            self._report_failure(
                driver, request_type,
                "open-start-page",
                self._tick_timer(),
                "Timeout waiting for 'LOG IN' button to be clickable."
            )
            return False

        self._reset_timer()
        try:
            login_link.click()
            self._wait_for_clickable_element(driver, By.ID, "kc-login")
            self._report_success(
                request_type,
                "open-login-page",
                self._tick_timer()
            )
        except TimeoutException:
            self._report_failure(
                driver,
                request_type,
                "open-login-page",
                self._tick_timer(),
                "Timeout"
            )
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
            self._report_failure(
                driver,
                request_type,
                "login",
                self._tick_timer(),
                "Timeout"
            )
            return False
        return True

    @task
    def runScenario(self):
        opts = webdriver.ChromeOptions()
        opts.add_argument("--headless")
        opts.add_argument("--window-size=1280,960")

        driver = webdriver.Chrome(chrome_options=opts)
        self.login(driver)
        driver.quit()


class UserLocust(HttpLocust):
    task_set = UserScenario
    host = "{}://{}".format(_serverScheme, _serverHost)
    min_wait = 1000
    max_wait = 1000
