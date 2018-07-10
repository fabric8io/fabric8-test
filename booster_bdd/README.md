# BDD tests for the OSIO boosters

## Pre-requisities

### Install a browser and a WebDriver

```bash
yum install chromium chromium-headless chromedriver
```

### Install python packages

```bash
pip install behave allure-behave jmespath pytest requests selenium
```

### (Optional) Install Allure framework

This is needed for viewing of the HTML report of the tests' results.

1. Download Allure from the [websites](https://bintray.com/qameta/generic/allure2).
1. Unzip to archive into a local directory `$ALLURE_HOME`
1. Add `$ALLURE_HOME` to the `$PATH`:

```bash
export PATH=$PATH:$ALLURE_HOME/bin
```

## Run the tests locally

Set environmental variables for `OSO_CLUSTER_ADDRESS`, `OSIO_USERNAME` and `OSIO_PASSWORD` or update the `config/config.sh` file and run the `run.sh`.

Example:

```bash
OSO_CLUSTER_ADDRESS='https://api.starter-us-east-2a.openshift.com:443' OSIO_USERNAME=... OSIO_PASSWORD=... ./run.sh
```

It is also possible to use an alternative configuration file (e.g. `config/prod-preview.sh`):

```bash
./run.sh prod-preview
```

The test will run and save the results under `$REPORT_DIR` directory(default name is `./test_output`).

## View Allure report

```bash
allure serve $REPORT_DIR
```

It will start a tiny local web server with the report.

## :warning: Generate Allure HTML report

It is possible to generate an HTML report by:

```bash
allure generate $REPORT_DIR -c -o allure-report
```

However, openning the report in Chrome is blocked by a security feature of the Chrome browser that prevents cross-origin requests to the local file system. That results in the following error:

```txt
Failed to load file:///.../allure-report/widgets/summary.json: Cross origin requests are only supported for protocol schemes: http, data, chrome, chrome-extension, https.
```

So it's better to use the above `allure serve`.