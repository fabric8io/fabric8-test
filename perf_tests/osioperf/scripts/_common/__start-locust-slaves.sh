#!/bin/bash

#source _setenv.sh

LOCUST_FILE=${1:-osioperf.py}

if [ -f $LOCUST_FILE ] ; then
	for i in $(seq 1 $SLAVES); do
		SLAVE_HOST="$SLAVE_PREFIX$i";
		echo "Starting a client at $SLAVE_HOST ($i/$SLAVES) ...";
		scp $LOCUST_FILE $SSH_USER@$SLAVE_HOST:$SSH_WORKDIR/$JOB_BASE_NAME-$BUILD_NUMBER-locustfile.py;
		ssh $SSH_USER@$SLAVE_HOST "chmod u+w $SSH_WORKDIR/users.env"
		scp $ENV_FILE $SSH_USER@$SLAVE_HOST:$SSH_WORKDIR/users.env
		CMD="nohup locust -f $JOB_BASE_NAME-$BUILD_NUMBER-locustfile.py --loglevel=WARNING --slave --master-host=$MASTER_HOST 2>$JOB_BASE_NAME-$BUILD_NUMBER-locust-slave-$i.log > $JOB_BASE_NAME-$BUILD_NUMBER-locust-slave-$i.log &";
		echo "Running $CMD";
		echo $CMD > $$-slave-$i;
		nohup ssh $SSH_USER@$SLAVE_HOST "source $SSH_WORKDIR/users.env; bash -s" < $$-slave-$i;
		rm -rf $$-slave-$i;
	done
else
	echo "$LOCUST_FILE not found";
	exit 1;
fi


