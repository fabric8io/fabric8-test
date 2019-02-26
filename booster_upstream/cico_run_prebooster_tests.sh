#!/bin/bash

# Do not reveal secrets
set +x

# Do not exit on failure so that artifacts can be archived
set +e

# Source environment variables of the jenkins slave
# that might interest this worker.
if [ -e "../jenkins-env" ]; then
  grep -E "(JENKINS_URL|\
    |GIT_BRANCH|\
    |GIT_COMMIT|\
    |JOB_NAME|\
    |BUILD_NUMBER|\
    |ghprbSourceBranch|\
    |ghprbActualCommit|\
    |BUILD_URL|\
    |ghprbPullId|\
    |PROJECT_NAME|\
    |BOOSTER_NAME|\
    |CLUSTER|\
    |BOOSTER_REPO|\
    |OS_USERNAME|\
    |OS_PASSWORD|\
    |REPORT_DIR|\
    |UI_HEADLESS|\
    |ZABBIX_ENABLED|\
    |ZABBIX_SERVER|\
    |ZABBIX_HOST|\
    |ZABBIX_METRIC_PREFIX)=" ../jenkins-env \
    | sed 's/^/export /g' \
    > /tmp/jenkins-env
  source /tmp/jenkins-env
fi

# Assign default values if not defined in Jenkins job

## An output directory where the reports will be stored
export REPORT_DIR=${REPORT_DIR:-target}

## 'true' if the UI parts of the test suite are to be run in headless mode (default value is 'true')
export UI_HEADLESS=${UI_HEADLESS:-true}

export ZABBIX_ENABLED="${ZABBIX_ENABLED:-false}"

export ZABBIX_SERVER="${ZABBIX_SERVER:-zabbix.devshift.net}"

export ZABBIX_HOST="${ZABBIX_HOST:-qa_openshift.io}"

export ZABBIX_METRIC_PREFIX="${ZABBIX_METRIC_PREFIX:-booster-bdd.$SCENARIO}"

export ARTIFACTS_DIR="prebooster/${JOB_NAME}/${BUILD_NUMBER}"
mkdir -p "$ARTIFACTS_DIR"
LATEST_LINK_PATH="prebooster/${JOB_NAME}/latest"
ln -sfn "$BUILD_NUMBER" "$LATEST_LINK_PATH"

export TEST_LOG="$ARTIFACTS_DIR/test.log"

echo "Running the test while redirecting the output to $TEST_LOG ..."

{ ## output only to $TEST_LOG
  # If report dir did exist, remove artifacts from previous run
  rm -rf "$REPORT_DIR"
  mkdir -p "$REPORT_DIR"

  # We need to disable selinux for now
  /usr/sbin/setenforce 0
  yum -y install docker 
  service docker start

  export CONTAINER_NAME="fabric8-booster-test"

  # Shutdown container if running
  if [ -n "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then
      docker rm -f "$CONTAINER_NAME"
  fi

  # Build builder image
  cp /tmp/jenkins-env .
  docker build -t $CONTAINER_NAME:latest -f Dockerfile.builder .

  # Run and setup Docker image
  docker run -it --shm-size=256m --detach=true --name="$CONTAINER_NAME" --cap-add=SYS_ADMIN \
            -e PROJECT_NAME \
            -e BOOSTER_NAME \
            -e CLUSTER \
            -e BOOSTER_REPO \
            -e OS_USERNAME \
            -e OS_PASSWORD \
            -e REPORT_DIR \
            -e UI_HEADLESS \
            -e ZABBIX_SERVER \
            -e ZABBIX_HOST \
            -e ZABBIX_METRIC_PREFIX \
            -t -v /etc/localtime:/etc/localtime:ro "$CONTAINER_NAME:latest" /bin/bash

  # Exec booster tests
  docker exec "$CONTAINER_NAME" ./prebooster_cico.sh

  if [ "${ZABBIX_ENABLED,,}" = true ] ; then
      docker exec "$CONTAINER_NAME" zabbix_sender -vv -T -i "./$REPORT_DIR/zabbix-report.txt" -z "$ZABBIX_SERVER"
  fi

  # Test results to archive
  docker cp "$CONTAINER_NAME:/opt/fabric8-test/$REPORT_DIR/." "$ARTIFACTS_DIR"

  # Shutdown container if running
  if [ -n "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then
      docker rm -f "$CONTAINER_NAME"
  fi

  # Generate 'link' pages
  echo "<html><head><meta http-equiv=\"refresh\" content=\"0;url=$BUILD_URL\"/></head></html>" > "$ARTIFACTS_DIR/jenkinsBuild.html"
}>>"$TEST_LOG" 2>&1

# Archive the test results
chmod 600 ../artifacts.key
chown root:root ../artifacts.key
rsync --password-file=../artifacts.key -qPHva --relative "./$ARTIFACTS_DIR" "$LATEST_LINK_PATH" devtools@artifacts.ci.centos.org::devtools/
ARTIFACTS_UPLOAD_EXIT_CODE=$?

echo
echo

if [ $ARTIFACTS_UPLOAD_EXIT_CODE -eq 0 ]; then
  echo "Artifacts were uploaded to http://artifacts.ci.centos.org/devtools/$ARTIFACTS_DIR"
  echo "Test results (Allure report) can be found at http://artifacts.ci.centos.org/devtools/$ARTIFACTS_DIR/allure-report"
else
  echo "ERROR: Failed to upload artifacts to http://artifacts.ci.centos.org/devtools/$ARTIFACTS_DIR"
fi

echo
echo

# We do want to see that zero specs have failed
grep "Success" target/results.txt
export RTN_CODE=$?
exit $RTN_CODE



