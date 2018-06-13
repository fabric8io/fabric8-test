import os
import sys
import threading
import time
import json
import re
import traceback
import uuid
import urlparse
import httplib
import requests

from selenium import webdriver
from selenium.common.exceptions import NoSuchWindowException, TimeoutException
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait, Select

user_tokens = []


class LoginUsersOauth2:
    timeout = 60

    userNames = []
    userPasswords = []

    metrics = {
        "open-login-page": [],
        "get-code": [],
        "get-token": [],
        "login": []
    }

    maxUsers = -1
    baseUrl = ""
    startUrl = ""
    clientId = ""
    redirectUrl = ""
    userTokensIncludeUsername = False

    driver = None

    start = -1
    stop = -1

    output = None

    def __init__(self, username="", password=""):

        self.maxUsers = int(os.getenv("MAX_USERS", "-1"))

        self.baseUrl = os.getenv("AUTH_SERVER_ADDRESS")

        self.clientId = os.getenv("AUTH_CLIENT_ID")

        self.redirectUrl = "{}/api/status".format(self.baseUrl)

        self.userTokensIncludeUsername = (
            os.getenv("USER_TOKENS_INCLUDE_USERNAME", "False") == "True"
        )

        if username == "" or password == "":
            usersPropertiesFile = os.getenv(
                "USERS_PROPERTIES_FILE",
                "users.properties"
            )

            usersProperties = open(usersPropertiesFile)

            for u in usersProperties:
                up = u.split('=')
                self.userNames.append(up[0].strip())
                self.userPasswords.append(up[1].strip())
            usersProperties.close()
        else:
            self.userNames.append(username)
            self.userPasswords.append(password)

    def reset_timer(self):
        self.start = time.time()

    def tick_timer(self):
        self.stop = time.time()
        ret_val = (self.stop - self.start) * 1000
        self.start = self.stop
        return ret_val

    def wait_for_clickable_element(self, by, value, timeout=-1):
        if timeout < 0:
            timeout = self.timeout
        element = WebDriverWait(self.driver, timeout).until(
            EC.element_to_be_clickable((by, value))
        )
        return element

    def wait_for_url(self, url_contains):
        return WebDriverWait(self.driver, self.timeout).until(
            EC.url_contains(url_contains)
        )

    def log(self, msg):
        print "[INFO] {}".format(
            str(msg)
        )

    def report_success(self, name, response_time):
        self.log(
            "[OK]    {}:{}ms".format(
                name,
                str(response_time)
            )
        )

    def report_failure(self, name, response_time, msg):
        traceback.print_exc()
        self.log(
            "[ERROR] {}:{}ms".format(
                name,
                str(response_time)
            )
        )
        self.driver.quit()

    def save_snapshot(self, name):
        self.driver.save_screenshot("{}.png".format(name))

    def save_browser_log(self, name):
        f = open("{}.log".format(name), "w")
        f.write(str(self.driver.get_log('browser')))

    def login(self, userIndex=0, _failed=False):
        failed = _failed
        request_type = "login-users-log"

        state = str(uuid.uuid4())
        code = ""

        userName = self.userNames[userIndex]

        metric = "open-login-page"
        if not failed:
            self.reset_timer()
            try:
                startUrl = '{}/api/authorize?response_type=code&client_id={}&redirect_uri={}&state={}'.format(
                    self.baseUrl,
                    self.clientId,
                    self.redirectUrl,
                    state
                )
                self.driver.get(startUrl)
                self.wait_for_clickable_element(By.ID, "kc-login")
                rt = self.tick_timer()
                self.metrics[metric].append(rt)
                self.report_success("{}-{}".format(userName, metric), rt)
            except Exception as ex:
                self.report_failure(
                    "{}-{}".format(userName, metric),
                    self.tick_timer(),
                    str(ex)
                )
                failed = True
        else:
            self.report_failure(
                "{}-{}".format(userName, metric),
                self.tick_timer(),
                "Timeout"
            )

        rt_get_code = -1
        metric = "get-code"
        if not failed:
            try:
                self.driver.find_element_by_id(
                    "username"
                ).send_keys(self.userNames[userIndex])
                passwd = self.driver.find_element_by_id("password")
                passwd.send_keys(self.userPasswords[userIndex])

                self.reset_timer()
                passwd.submit()
                self.wait_for_url(state)

                parsed = urlparse.urlparse(self.driver.current_url)
                code = urlparse.parse_qs(parsed.query)['code'][0]
                rt_get_code = self.tick_timer()
                self.metrics[metric].append(rt_get_code)
                self.report_success(
                    "{}-{}".format(userName, metric),
                    rt_get_code
                )
            except Exception as ex:
                self.report_failure(
                    "{}-{}".format(userName, metric),
                    self.tick_timer(),
                    str(ex)
                )
                failed = True
        else:
            self.report_failure(
                "{}-{}".format(userName, metric),
                self.tick_timer(),
                "Timeout"
            )

        global user_tokens
        metric = "get-token"
        if not failed:
            self.reset_timer()
            try:
                data = "grant_type=authorization_code&client_id={}&code={}&redirect_uri={}".format(
                    self.clientId,
                    code,
                    self.redirectUrl
                )
                headers = {"Content-type": "application/x-www-form-urlencoded"}
                tokenUrl = "{}/api/token".format(self.baseUrl)
                response = requests.post(tokenUrl, data, headers=headers)
                content = response.content
                try:
                    resp_json = response.json()
                    if not response.ok:
                        self.report_failure(
                            "{}-{}".format(userName, metric),
                            self.tick_timer(),
                            "Got wrong response: [{}]".format(content)
                        )
                    else:
                        rt = self.tick_timer()
                        out = "{};{}".format(
                            resp_json["access_token"],
                            resp_json["refresh_token"]
                        )
                        if self.userTokensIncludeUsername:
                            out = "{};{}".format(
                                out,
                                self.userNames[userIndex]
                            )

                        user_tokens.append(out)

                        self.metrics[metric].append(rt)
                        self.report_success(
                            "{}-{}".format(userName, metric),
                            rt
                        )
                        self.metrics["login"].append(rt + rt_get_code)
                        self.report_success(
                            "{}-login".format(userName),
                            rt+rt_get_code
                        )
                except ValueError:
                    response.failure(
                        "Got wrong response: [{}]".format(content)
                    )
            except Exception as ex:
                self.report_failure(
                    "{}-{}".format(userName, metric),
                    self.tick_timer(),
                    str(ex)
                )
                failed = True
        else:
            self.report_failure(
                "{}-{}".format(userName, metric),
                self.tick_timer(),
                "Timeout"
            )

        return failed

    def login_users(self):

        opts = webdriver.ChromeOptions()
        opts.add_argument("--headless")
        opts.add_argument("--window-size=1920,1080")
        opts.add_argument("--window-position=0,0")

        overall_start = time.time()
        try:
            failed = False
            global user_tokens
            del user_tokens[:]
            n = 0
            for u in self.userNames:
                self.log("Loggin user {} in".format(u))
                if self.maxUsers > 0 and n >= self.maxUsers:
                    break
                self.driver = webdriver.Chrome(chrome_options=opts)
                failed = self.login(n) | failed
                self.driver.quit()
                n += 1

            if not failed:
                self.log("All {} users done.".format(str(n)))

                for k in self.metrics.keys():
                    mSorted = self.metrics[k]
                    mSorted.sort()
                    self.log(
                        "{}-time-stats:count={};min={};med={};max={}".format(
                            k,
                            n,
                            mSorted[0],
                            mSorted[int(n/2)],
                            mSorted[int(n-1)]
                        )
                    )

            else:
                self.report_failure(
                    "global",
                    (time.time() - overall_start) * 1000,
                    "Something went wrong."
                )

        except NoSuchWindowException:
            sys.exit(1)
