# Red Hat Developer Performance Tests
This document describes the (always expanding) suite of performance tests for Red Hat Developer. Topics covered in this document include the design and implementation of the tests, how the tests are executed, and how test results can be evaluated.


# Test Type: Red Hat Developer CRUD Soak Test
## How it works
This test exercises the Red Hat Developer "core" server. This test makes use of the "Perfcake" (https://www.perfcake.org/) automated test framework. The test is divided into 4 separate phases. In each phase ```N``` number of operations (```ITERATIONS```) is performed:
* ```CREATE```
   * Create ```N``` unique workitems in the default space.
   * Remember IDs of all the created workitems (```WID```).
* ```READ```
   * For each of the ```WID``` retrieve the workitem.
* ```UPDATE```
   * For each of the ```WID``` change the workitem's ```system.title``` attribute.
* ```DELETE```
   * For each of the ```WID``` delete the workitem.

All those 4 phases together are called a soak test *CYCLE*.

The *SOAK* test is then executed in the cycles until the required time span is reached.

Before each phase a new set of authentication tokens is generated to simulate a number of different users (```USERS```).
Those tokens are used in the particular phase to authenticate to the REST API.

After each phase is done the number of workitems in the DB is checked to confirm, that the system behaves as expected.

The results from each phase of each cycle is reported to see the trends in the system during the longterm load.

## How to run the test manually
### Configure test parameters in ```./_setenv.sh```:
* `WORKSPACE` - A root directory under which all the work is done.

* `ITERATIONS` - The number of iterations that will be performed in each of the CRUD phase.

* `THREADS` - The number of concurrent threads that will be accessing the Core server at any time when performing the CRUD operations.

* `USERS` - The number of virtual users that will access the Core server. Each user has a unique authentication token generated for him by the Core server.

* `SERVER_HOST` - The hostname or an IP address of the Core server's REST API, where the requests to perform CRUD operations are sent by the clients. When the hostname is `localhost` a fresh instance of the Core server and a PostgreSQL DB is created and started locally as a Docker containers.

* `SERVER_PORT` - The port number of the Core server's REST API, where the requests to perform CRUD operations are sent by the clients.

* `DURATION` - A test duration in seconds. The test will perform a new soak cycles until the duration is reached. Low value (e.g. 10) means that only one cycle of CRUD is run. (Example: for the soak test to run approximatelly 12h set `DURATION` to `43200`)

* `PERFREPO_ENABLED` - `true` if the results from each soak cycle should be reported to the [PerfRepo](http://perfrepo.mw.lab.eng.bos.redhat.com) as a new Test Execution along with some tags. The additional tags specific for each build can be set via `ADDITIONAL_PERFREPO_TAGS` parameter.

* `ADDITIONAL_PERFREPO_TAGS` - The results from each soak cycle is reported to the [PerfRepo](http://perfrepo.mw.lab.eng.bos.redhat.com) as a new Test Execution along with some tags providing meta-data about the particular soak test. This parameter allows to set additional tags separated by a semicolon `;`.

* `ZABBIX_HOST_PREFIX` - This is the host name for the Zabbix report for which the results will be associated with.

### Execute `./devtools-performance-core-crud-soak.sh`.
* !!! **DOCKER ALERT: THIS SCRIPT REMOVES ALL DOCKER CONTAINERS AND VOLUMES FOR A CLEAN ENVIRONMENT** !!!

### View results
* When test is done, open `./devtools-performance-results/0/` directory to see the test results. Open `./devtools-performance-results/0/perfcake-chart/index.html` to see the result charts.
  
## How to run the automated test
### Start a Jenkins job
* Go to the Jenkins [job](https://fuse-qe-jenkins-rhel7.rhev-ci-vms.eng.rdu2.redhat.com/view/Performance/job/devtools-performance-core-crud-soak/) and hit the [Build with Parameters](https://fuse-qe-jenkins-rhel7.rhev-ci-vms.eng.rdu2.redhat.com/view/Performance/job/devtools-performance-core-crud-soak/build?delay=0sec) button.
* Keep the parameters intact for the duration of 12 hours and to test the Core server locally. 
   * ```SERVER_HOST``` and ```SERVER_PORT``` are the host name or the IP address and a port number of the Core server's REST API, where the requests to perform CRUD operations are sent by the clients.
     If the value is ```localhost``` (the default) a fresh instance of the Core server and a PostgreSQL DB is created and started locally as a Docker containers at the same node so all the traffic is over localhost.
### Create a report
* Go to the [PerfRepo](http://perfrepo.mw.lab.eng.bos.redhat.com) instance and login.
* Go to the [Reports](http://perfrepo.mw.lab.eng.bos.redhat.com/reports/) section and create a new [Metric history](http://perfrepo.mw.lab.eng.bos.redhat.com/reports/metric) report.
   * Name the report: ```Red Hat Developer CRUD: SOAK (<YYYY-MM-DD>)```
   * Set permissions:
      * Click to [Permission setting] to open a permission table
      * Using [+] button on the right-top corner of the table add 2 new permissions to the report one-by-one:
         * Access type: ```READ```, Access Level: ```Public```
         * Access type: ```WRITE```, Access Level: ```Public```
   * Using the [+ Add chart] button create 4 charts:
      * Name: ```CREATE```, Test: ```Red Hat Developer Core: CREATE```
      * Name: ```READ```, Test: ```Red Hat Developer Core: READ```
      * Name: ```UPDATE```, Test: ```Red Hat Developer Core: UPDATE```
      * Name: ```DELETE```, Test: ```Red Hat Developer Core: DELETE```
   * Using [+ Add seiries] button create 4 series:
      * Chart: ```CREATE```, Series name: ```<YYYY-MM-DD> #<core-commit>```, Metric: ```throughput```, Tags: ```jenkins=jenkins-<jenkins-job>-<build-number>```
      * Chart: ```READ```, Series name: ```<YYYY-MM-DD> #<core-commit>```, Metric: ```throughput```, Tags: ```jenkins=jenkins-<jenkins-job>-<build-number>```
      * Chart: ```UPDATE```, Series name: ```<YYYY-MM-DD> #<core-commit>```, Metric: ```throughput```, Tags: ```jenkins=jenkins-<jenkins-job>-<build-number>```
      * Chart: ```DELETE```, Series name: ```<YYYY-MM-DD> #<core-commit>```, Metric: ```throughput```, Tags: ```jenkins=jenkins-<jenkins-job>-<build-number>```
   * Using [Save] button, save the report
   * TODO: @ldimaggi insert a link to the bluejeans recording of the report creation
* The report can now be found in the report list under the [Reports](http://perfrepo.mw.lab.eng.bos.redhat.com/reports/) section.

#
