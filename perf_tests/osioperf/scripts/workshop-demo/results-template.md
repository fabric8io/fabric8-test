# Results (@@JOB_BASE_NAME@@ #@@BUILD_NUMBER@@ @@TIMESTAMP@@)
## Summary
The following tables show the final results taken and computed from a single test run - i.e. after and by running the login phase and the 5 minutes of the load phase.

The summary results of each run are uploaded to the
[Zabbix](https://zabbix.devshift.net:9443/zabbix/)
monitoring system to track the results' history.

### Load Test
| Scenario | Minimal | Median | Maximal | Failed |
| :--- | ---: | ---: | ---: | ---: |
@@GENERATE_LOAD_TEST_TABLE@@

## Test charts
The charts bellow show the whole duration of all the phases for each scenario - i.e. what lead to the final results shown above in the summary.

### Load Test
In these charts, the value shown in each point of time is the metric (minimal, median, maximal and average value) of the response time
computed for a time window from the start to the respective point of time. So it is a floating metric.

That is the reason for the values of the maximals always go up.
@@GENARATE_LOAD_TEST_CHARTS@@
