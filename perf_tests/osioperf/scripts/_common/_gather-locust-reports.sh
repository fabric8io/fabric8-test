#!/bin/bash

#source _setenv.sh

scp $SSH_USER@$MASTER_HOST:"$SSH_WORKDIR/$JOB_BASE_NAME-$BUILD_NUMBER-report*" .;
scp $SSH_USER@$MASTER_HOST:$SSH_WORKDIR/$JOB_BASE_NAME-$BUILD_NUMBER-locust-master.log .;
for i in $(seq 1 $SLAVES); do
	scp $SSH_USER@$SLAVE_PREFIX$i:$SSH_WORKDIR/$JOB_BASE_NAME-$BUILD_NUMBER-locust-slave-$i.log .;
done


