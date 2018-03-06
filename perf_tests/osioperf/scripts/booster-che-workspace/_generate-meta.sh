#!/bin/bash

source _setenv.sh

METRIC_META_FILE=${1:-_metrics.meta}

for i in `cat $METRIC_META_FILE`; do
	if [ "${i:0:1}" != "#" ]; then
		metric_meta=(`echo $i | tr ";" " "`)
		metric_request_type=${metric_meta[0]}
		metric_name=${metric_meta[1]}
		metric_name_caps=`echo $metric_name | tr /a-z/ /A-Z/ | sed -e 's,-,_,g'`
		zabbix_metric_prefix="$JOB_BASE_NAME.$metric_request_type.$metric_name"

		#@@GENERATE_LOCUST_LOG_TO_CSV@@
		lltc="$lltc\n\$COMMON/_locust-log-to-csv.sh '$metric_request_type $metric_name' $JOB_BASE_NAME-$BUILD_NUMBER-locust-master.log"

		#@@GENERATE_ZABBIX_PROCESS_LOAD@@
		zpl="$zpl\n./__zabbix-process-load.sh '\"$metric_request_type\"\\,\"$metric_name\"' \"$zabbix_metric_prefix\" >> \$ZABBIX_LOG"

		#@@GENERATE_CSV_TO_PNG@@
		ctp="$ctp\nfor c in \$(find *.csv | grep '\\\\-$metric_request_type\_$metric_name\\'); do echo \$c; \$COMMON/_csv-response-time-to-png.sh \$c; \$COMMON/_csv-throughput-to-png.sh \$c; \$COMMON/_csv-failures-to-png.sh \$c; done"

		#@@GENERATE_DISTRIBUTION_2_CSV@@
		dtc="$dtc\ndistribution_2_csv \$c '\"$metric_request_type $metric_name\"';"

		#@@GENERATE_FILTER_ZABBIX_VALUE@@
		fzv="$fzv\nfilterZabbixValue \$ZABBIX_LOG \"$zabbix_metric_prefix-rt_min\" \"@@"$metric_name_caps"_MIN@@\" \$RESULTS_FILE;"
		fzv="$fzv\nfilterZabbixValue \$ZABBIX_LOG \"$zabbix_metric_prefix-rt_median\" \"@@"$metric_name_caps"_MEDIAN@@\" \$RESULTS_FILE;"
		fzv="$fzv\nfilterZabbixValue \$ZABBIX_LOG \"$zabbix_metric_prefix-rt_max\" \"@@"$metric_name_caps"_MAX@@\" \$RESULTS_FILE;"
		fzv="$fzv\nfilterZabbixValue \$ZABBIX_LOG \"$zabbix_metric_prefix-rt_average\" \"@@"$metric_name_caps"_AVERAGE@@\" \$RESULTS_FILE;"
		fzv="$fzv\nfilterZabbixValue \$ZABBIX_LOG \"$zabbix_metric_prefix-failed\" \"@@"$metric_name_caps"_FAILED@@\" \$RESULTS_FILE;"
		
		#@@GENERATE_LOAD_TEST_TABLE@@
		if [[ -z $ltt ]]; then
			ltt="| \`$metric_name\` | @@$metric_name_caps""_MIN@@ ms | @@$metric_name_caps""_MEDIAN@@ ms | @@$metric_name_caps""_MAX@@ ms | @@$metric_name_caps""_FAILED@@ |"
		else
			ltt="$ltt\n| \`$metric_name\` | @@$metric_name_caps""_MIN@@ ms | @@$metric_name_caps""_MEDIAN@@ ms | @@$metric_name_caps""_MAX@@ ms | @@$metric_name_caps""_FAILED@@ |"
		fi

		#@@GENARATE_LOAD_TEST_CHARTS@@
		ltch="$ltch\n#### \`$metric_name\` Response Time"
		ltch="$ltch\n![$metric_name-reponse-time](./$JOB_BASE_NAME-$BUILD_NUMBER-$metric_request_type""_$metric_name-response-time.png)"
		ltch="$ltch\n![$metric_name-minimal-reponse-time](./$JOB_BASE_NAME-$BUILD_NUMBER-$metric_request_type""_$metric_name-minimal-response-time.png)"
		ltch="$ltch\n![$metric_name-median-reponse-time](./$JOB_BASE_NAME-$BUILD_NUMBER-$metric_request_type""_$metric_name-median-response-time.png)"
		ltch="$ltch\n![$metric_name-maximal-reponse-time](./$JOB_BASE_NAME-$BUILD_NUMBER-$metric_request_type""_$metric_name-maximal-response-time.png)"
		ltch="$ltch\n![$metric_name-average-reponse-time](./$JOB_BASE_NAME-$BUILD_NUMBER-$metric_request_type""_$metric_name-average-response-time.png)"
		ltch="$ltch\n![$metric_name-rt-histo](./$JOB_BASE_NAME-$BUILD_NUMBER-$metric_request_type""_$metric_name-rt-histo.png)"
		ltch="$ltch\n#### \`$metric_name\` Failures"
		ltch="$ltch\n![$metric_name-failures](./$JOB_BASE_NAME-$BUILD_NUMBER-$metric_request_type""_$metric_name-failures.png)"
	fi
done

sed -e 's,@@GENERATE_LOCUST_LOG_TO_CSV@@,'"$lltc"',g' _execute-template.sh \
| sed -e 's,@@GENERATE_CSV_TO_PNG@@,'"$ctp"',g'\
| sed -e 's,@@GENERATE_DISTRIBUTION_2_CSV@@,'"$dtc"',g'\
| sed -e 's,@@GENERATE_FILTER_ZABBIX_VALUE@@,'"$fzv"',g' > _execute.sh
chmod +x _execute.sh

sed -e 's,@@GENERATE_ZABBIX_PROCESS_LOAD@@,'"$zpl"',g' _zabbix-process-results-template.sh > _zabbix-process-results.sh
chmod +x _zabbix-process-results.sh

sed -e 's,@@GENERATE_LOAD_TEST_TABLE@@,'"$ltt"',g' results-template.md \
| sed -e 's,@@GENARATE_LOAD_TEST_CHARTS@@,'"$ltch"',g' > $JOB_BASE_NAME-$BUILD_NUMBER-results-template.md