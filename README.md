Fabric8-Test 
============

Functional tests for OSiO (OpenShift.io) platform.

## End to end test on OSiO

See: https://github.com/fabric8io/fabric8-test/blob/master/ee_tests/README.md


## API tests on OSiO

Our API tests use [pyresttest](https://github.com/svanoort/pyresttest.git) a Python test framework that make all your API test declarative. No need to learn python, your test are plain old yaml file!

### Pre-requisite

* Install Python pip

```
sudo python get-pip.py
```

* Install pyresttest (>=1.7.1)

```
git clone https://github.com/svanoort/pyresttest.git
cd pyresttest
sudo python setup.py install
```

* Install pyresttest dependencies

```
cd EE_API_automation/pyresttest/setup
pip install -U -r requirements.txt
```

### Run API test against PROD

#### WIT API

* To run create space script:

```
cd EE_API_automation/pyresttest/
pyresttest https://api.openshift.io get_a_space.yaml --vars="{'token': 'YOUR_OSIO_TOKEN', 'userid': 'YOUR_OSIO_ACCOUNT', 'space_name_var': 'spacename'}"
```
where YOUR_OSIO_ACCOUNT is your [OSiO account]() and YOUR_OSIO_TOKEN can be either taken form your browser devtools searching localStorage for `auth_token` key or going to your profile page -> `update profile` -> `Advanced` -> `Personal Access Token` copy button. 

#### Forge API

The forge API target [Forge REST backend]() using [Forge addon logic]().
As a pre-requisites, Forge API still need to create a space in WIT API.
The is 2 main flow tested:

* To run import wizard flow:

```
cd EE_API_automation/pyresttest/
./run_forge_import_api_test.sh YOUR_OSIO_ACOUNT YOUR_OSIO_TOKEN
```

> NOTE: Depending whether your GitHub account belong to an organisation or not the API response is different. the bash script wraps the difference and run the relevant tests.

* To run import wizard flow:

```
cd EE_API_automation/pyresttest/
./run_forge_quickstart_api_test.sh YOUR_OSIO_ACOUNT YOUR_OSIO_TOKEN [GITHUB_ACCOUNT] [GITHUB_TOKEN_WITH_DELETE_SCOPE]
```

> NOTE: [GITHUB_ACCOUNT] and [GITHUB_TOKEN_WITH_DELETE_SCOPE] are optionals. If not provided your GitHub account will keep the newly created repository. This repository is prefixed with a UUID.

