#!/bin/bash

source _setenv.sh

rm -rvf '*.json'
rm -rvf '*.log'

export ZABBIX_LOG=$JOB_BASE_NAME-$BUILD_NUMBER-zabbix.log
export ZABBIX_TIMESTAMP=`date +%s`

export PODS="0"
list=(`echo $EXPECTED_PODS`)

while read user; do
	USER=(`echo $user | tr "=" " "`)
	oc login https://api.starter-us-east-2.openshift.com -u "${USER[0]}" -p "${USER[1]}"
	if [ $? -gt 0 ]; then
		echo "ERROR: Unable to login user ${USER[0]}"
		continue
	fi
	USERNAME=`oc whoami`
	TOKEN=`oc whoami -t`
	JSON=`curl -L --silent -X GET -H "Authorization: Bearer $TOKEN" $OSO_ADDRESS/oapi/v1/namespaces/$USERNAME-jenkins/deploymentconfigs`
	echo $JSON > $USERNAME-jenkins-status.json
	JENKINS_AVAILABLE=`echo $JSON | jq ".items[] | select(.metadata.name==\"jenkins\") | .status.conditions[] | select (.type==\"Available\") | .status" | tr -d '"'`
	oc logout
	if [ "$JENKINS_AVAILABLE" == "True" ]; then
		echo "$ZABBIX_HOST $USERNAME-jenkins.pod.available $ZABBIX_TIMESTAMP 1" >> $ZABBIX_LOG
		export PODS=`expr $PODS + 1`
		for (( i=0; i<${#list[@]}; i++ )); do
			if [[ "${list[i]}" == "$USERNAME-jenkins" ]]; then
				list=( "${list[@]:0:$i}" "${list[@]:$((i + 1))}" )
			fi
		done
	fi
done < $USERS_PROPERTIES_FILE

for (( i=0; i<${#list[@]}; i++ )); do
	echo "$ZABBIX_HOST ${list[i]}.pod.available $ZABBIX_TIMESTAMP 0" >> $ZABBIX_LOG
done

echo "$ZABBIX_HOST jenkins.pods.available $ZABBIX_TIMESTAMP $PODS" >> $ZABBIX_LOG

cat $ZABBIX_LOG

if [[ "$ZABBIX_REPORT_ENABLED" = "true" ]]; then
	echo "  Uploading report to zabbix...";
	zabbix_sender -vv -i $ZABBIX_LOG -T -z $ZABBIX_SERVER -p $ZABBIX_PORT;
fi
