#set -x

source ./_setenv.sh

echo "Starting DB at $DB_HOST:$SERVER_PORT instance"

# Check for docker
docker info >> /dev/null
[[ $? -ne 0 ]] && exit 1

docker rm -f db

# Run the DB docker image (detached) that the core requires
docker run --name db -d -p $DB_PORT:5432 \
	-e POSTGRESQL_ADMIN_PASSWORD=$DB_PASSWORD \
	centos/postgresql-95-centos7
#-e POSTGRESQL_USER=$DB_USER \
#-e POSTGRESQL_PASSWORD=$DB_PASSWORD \
#-e POSTGRESQL_DATABASE=$DB_NAME \
#centos/postgresql-95-centos7
