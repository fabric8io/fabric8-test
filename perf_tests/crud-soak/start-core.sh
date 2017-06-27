#set -x

source ./_setenv.sh

echo "Need a local server - preparing Docker containers..."

# Check for docker
docker info >> /dev/null
[[ $? -ne 0 ]] && exit 1

# Build the core server that will provide our test client with tokens
# Download the core
rm -rf almighty-core*
git clone https://github.com/almighty/almighty-core.git --branch master 
cd almighty-core

# Cleanup and then build the docker core image
make docker-rm
sleep 10
make docker-start
sleep 10
make docker-build
sleep 10
make docker-image-deploy
sleep 10

docker rm -f core

# Run the docker core image (detached)
docker run -p $SERVER_PORT:8080 --name core -d \
	-e ALMIGHTY_LOG_LEVEL=info \
	-e ALMIGHTY_DEVELOPER_MODE_ENABLED=true \
	-e ALMIGHTY_POSTGRES_HOST=$DB_HOST \
	-e ALMIGHTY_POSTGRES_PORT=$DB_PORT \
	-e ALMIGHTY_POSTGRES_USER=$DB_USER \
	-e ALMIGHTY_POSTGRES_PASSWORD=$DB_PASSWORD \
	-e ALMIGHTY_POSTGRES_SSLMODE=$DB_SSL_MODE \
	-e ALMIGHTY_POSTGRES_CONNECTION_MAXIDLE=1 \
	-e ALMIGHTY_POSTGRES_CONNECTION_MAXOPEN=1 \
	almighty-core-deploy
