#set -x

# The following environment variable are assumed to be set properly (e.g. via Jenkins job parameters)
# A root directory under which all the work is done
export WORKSPACE=$PWD #This should be provided by Jenkins

# The number of iterations that will be performed in each of the CRUD phase.
export ITERATIONS=1000

# The number of concurrent threads that will be accessing the Core server at any time when performing the CRUD operations.
export THREADS=10

# The number of virtual users that will access the Core server. Each user has a unique authentication token generated for him by the Core server.
export USERS=1

# The hostname or an IP address of the Core server's REST API, where the requests to perform CRUD operations are sent by the clients.
# When the hostname is 'localhost' a fresh instance of the Core server and a PostgreSQL DB is created and started locally as a Docker containers.
export SERVER_HOST=localhost

# The port number of the Core server's REST API, where the requests to perform CRUD operations are sent by the clients.
export SERVER_PORT=80

# A test duration in seconds. The test will perform a new soak cycles until the duration is reached.
# Low value (e.g. 10) means that only one cycle of CRUD is run.
# (Example: for the soak test to run approximatelly 12h set DURATION to "43200")
export DURATION=10

# 'true' if the results from each soak cycle should be reported to the PerfRepo [http://perfrepo.mw.lab.eng.bos.redhat.com]
# as a new Test Execution along with some tags. The additional tags specific for each build can be set via ADDITIONAL_PERFREPO_TAGS parameter.
export PERFREPO_ENABLED=false

# The results from each soak cycle is reported to the PerfRepo[http://perfrepo.mw.lab.eng.bos.redhat.com]
# as a new Test Execution along with some tags providing meta-data about the particular soak test.
# This parameter allows to set additional tags separated by a semicolon ';'.
export ADDITIONAL_PERFREPO_TAGS="soak;12h"

# 'true' if the results from each soak cycle should be reported to Zabbix [zabbix.devshift.net]
export ZABBIX_REPORT_ENABLED=false

# This is the host name for the Zabbix report for which the results will be associated with.
export ZABBIX_HOST_PREFIX=PerfHost

# Java/Maven environment
#export JAVA_HOME=/qa/tools/opt/x86_64/jdk1.8.0_last;
#export M2_HOME=/qa/tools/opt/apache-maven-3.3.9
#export PATH=$PATH:$JAVA_HOME/bin:$M2_HOME/bin;
export MAVEN_OPTS="-Dmaven.repo.local=$WORKSPACE/local-maven-repo"
