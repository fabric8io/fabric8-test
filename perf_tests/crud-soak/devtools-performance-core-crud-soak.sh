#set -x

source ./_setenv.sh

echo "Running against the $SERVER_HOST:$SERVER_PORT instance"

cd $WORKSPACE

if [[ "$SERVER_HOST" == "localhost" ]];
then
	echo "Need a local server - preparing Docker containers..."

	# Check for docker
	docker info >> /dev/null
	[[ $? -ne 0 ]] && exit 1

	# Clean docker containers, volumes, images
	for i in `docker ps -a -q`; do docker rm -f $i; done
	for i in `docker volume ls -q`; do docker volume rm $i; done
	for i in `docker images -q`; do docker rmi $i; done

	# Build the core server that will provide our test client with tokens

	# Download the core
	rm -rf almighty-core*
	git clone https://github.com/almighty/almighty-core.git
	cd almighty-core

	# Run the DB docker image (detached) that the core requires
	docker run --name db -d -p 5432 -e POSTGRESQL_ADMIN_PASSWORD=mysecretpassword centos/postgresql-95-centos7

	# Cleanup and then build the docker core image
	make docker-rm
	sleep 10
	make docker-start
	sleep 10
	make docker-build
	sleep 10
	make docker-image-deploy
	sleep 10

	# Run the docker core image (detached)
	docker run -p $SERVER_PORT:8080 --name core -d -e ALMIGHTY_LOG_LEVEL=warning -e ALMIGHTY_DEVELOPER_MODE_ENABLED=true -e ALMIGHTY_POSTGRES_HOST=$(docker inspect --format '{{ .NetworkSettings.IPAddress }}' db 2>/dev/null) almighty-core-deploy
fi

while true;
do
   echo "Checking if the Core server is up and running ..."
   curl --silent http://$SERVER_HOST:$SERVER_PORT/api/status
   if [[ $? -eq 0 ]]; then
     response_code=`curl -i --silent http://$SERVER_HOST:$SERVER_PORT/api/status | head -n 1 | cut -d " " -f2`;
     if [[ "$response_code" -eq "200" ]]; then
       break;
     else
       echo "The Core server is not ready - responding by $response_code code.";
     fi;
   else
     echo "The Core server is not responding.";
   fi
   echo "Trying again after 10s.";
   sleep 10;
done
CORE_SERVER_STATUS=`curl --silent http://$SERVER_HOST:$SERVER_PORT/api/status | grep commit | sed -e 's,":",=,g' | sed -e 's,[{"}],,g' | sed -e 's,\,,;,g'`
BASE_PERFREPO_TAGS="$ADDITIONAL_PERFREPO_TAGS;server=$SERVER_HOST:$SERVER_PORT;$CORE_SERVER_STATUS"
export CORE_SERVER_COMMIT=`echo $CORE_SERVER_STATUS | sed -e 's,.*commit=\([^;]*\);.*,\1,g'`

cd $WORKSPACE

NOW=`date +%s`
STOP=`expr $NOW + $DURATION`
export CYCLE=0

chmod +x crud-perf-test.sh
while [ `date +%s` -lt $STOP ];
do
	export SOAK_TIMESTAMP=`date +%s`
	export ADDITIONAL_PERFREPO_TAGS="$BASE_PERFREPO_TAGS;soak-cycle=$CYCLE;timestamp=$SOAK_TIMESTAMP"
	./crud-perf-test.sh;
	export CYCLE=`expr $CYCLE + 1`
done

# Do not clean docker containers - for the debugging purposes
#if [[ "$SERVER_HOST" == "localhost" ]];
#then
#  for i in `docker ps -a -q`; do docker rm -f $i; done
#  for i in `docker volume ls -q`; do docker volume rm $i; done
#fi