import json, os, threading
from locust import HttpLocust, TaskSet, task
from datetime import datetime

serverScheme = "@@SERVER_SCHEME@@"
serverHost = "@@SERVER_HOST@@"
authPort = "@@AUTH_PORT@@"

_users = -1
_userTokens = []
_userRefreshTokens = []
_currentUser = 0
_userLock = threading.RLock()

usenv = os.getenv("USER_TOKENS")
lines = usenv.split('\n')

_users = len(lines)

for u in lines:
	up = u.split(';')
	_userTokens.append(up[0])
	_userRefreshTokens.append(up[1])

class TokenBehavior(TaskSet):

	taskUser = -1
	taskUserId = ""
	taskUserName = ""
	taskUserToken = ""
	taskUserRefreshToken = ""

	def on_start(self):
		global _currentUser, _users, _userLock, _userTokens, _userRefreshTokens
		_userLock.acquire()
		self.taskUser = _currentUser
		if _currentUser < _users - 1:
			_currentUser += 1
		else:
			_currentUser = 0
		_userLock.release()
		self.taskUserToken = _userTokens[self.taskUser]
		self.taskUserRefreshToken = _userRefreshTokens[self.taskUser]
		self.authUser()

	@task
	def authUser(self):
		response = self.client.get("/api/user", headers = {"Authorization" : "Bearer " + self.taskUserToken}, name = "auth-api-user", catch_response = True)
		content = response.content
		try:
			resp_json = response.json()
			if not response.ok:
				response.failure("Got wrong response: [" + content + "]")
			else:
				self.taskUserName = resp_json["data"]["attributes"]["username"]
				self.taskUserId = resp_json["data"]["attributes"]["identityID"]
				response.success()
		except ValueError:
			response.failure("Got wrong response: [" + content + "]")

	@task
	def userById(self):
		response = self.client.get("/api/users/" + self.taskUserId, name="api-user-by-id", catch_response = True)
		content = response.content
		try:
			resp_json = response.json()
			if not response.ok:
				response.failure("Got wrong response: [" + content + "]")
			else:
				response.success()
		except ValueError:
			response.failure("Got wrong response: [" + content + "]")

	@task
	def userByName(self):
		response = self.client.get("/api/users?filter[username]=" + self.taskUserName, name="api-user-by-name", catch_response = True)
		content = response.content
		try:
			resp_json = response.json()
			if not response.ok:
				response.failure("Got wrong response: [" + content + "]")
			else:
				response.success()
		except ValueError:
			response.failure("Got wrong response: [" + content + "]")

	@task
	def refreshToken(self):
		response = self.client.post("/api/token/refresh", data="{\"refresh_token\":\"" + self.taskUserRefreshToken+ "\" }", headers = {"Authorization" : "Bearer " + self.taskUserToken, "Content-Type" : "application/json"}, name="auth-api-token-refresh", catch_response = True)
		content = response.content
		try:
			resp_json = response.json()
			if not response.ok:
				response.failure("Got wrong response: [" + content + "]")
			else:
				response.success()
		except ValueError:
			response.failure("Got wrong response: [" + content + "]")

	@task
	def githubToken(self):
		response = self.client.get("/api/token?for=https://github.com", headers= {"Authorization" : "Bearer " + self.taskUserToken}, name = "auth-api-user-github-token", catch_response = True)
		content = response.content
		try:
			resp_json = response.json()
			if not response.ok:
				response.failure("Got wrong response: [" + content + "]")
			else:
				response.success()
		except ValueError:
			response.failure("Got wrong response: [" + content + "]")

class TokenUser(HttpLocust):
	host = serverScheme + "://" + serverHost + ":" + authPort
	task_set = TokenBehavior
	min_wait = 1000
	max_wait = 10000
